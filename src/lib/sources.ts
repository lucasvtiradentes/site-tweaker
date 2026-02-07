import { type Source, type SourceScript, generateId } from './configs'
import { CONFIG_FILE } from './constants'

interface ParsedGitHubUrl {
  owner: string
  repo: string
  branch: string
  path: string
}

interface SourceConfigScript {
  name: string
  file: string
  autoRun?: boolean
  match?: {
    domains?: string[]
    paths?: string[]
  }
  cspBypass?: string[]
}

interface SourceConfig {
  version: string
  name: string
  description?: string
  env?: { key: string; description?: string }[]
  scripts: SourceConfigScript[]
}

interface GitHubContentsResponse {
  content: string
  encoding: string
}

export function parseGitHubUrl(input: string): ParsedGitHubUrl | null {
  try {
    const url = new URL(input)
    if (url.hostname !== 'github.com') return null

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null

    const owner = parts[0]
    const repo = parts[1]
    let branch = 'main'
    let path = ''

    if (parts[2] === 'tree' || parts[2] === 'blob') {
      branch = parts[3] || 'main'
      path = parts.slice(4).join('/')
    }

    return { owner, repo, branch, path }
  } catch {
    return null
  }
}

function buildContentsApiUrl(parsed: ParsedGitHubUrl, filePath: string): string {
  const basePath = parsed.path ? `${parsed.path}/` : ''
  return `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${basePath}${filePath}?ref=${parsed.branch}`
}

function buildFetchHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function decodeBase64Content(base64: string): string {
  const binaryString = atob(base64.replace(/\n/g, ''))
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

export function validateSourceConfig(config: unknown): config is SourceConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  if (typeof c.version !== 'string') return false
  if (typeof c.name !== 'string') return false
  if (!Array.isArray(c.scripts)) return false

  for (const script of c.scripts) {
    if (typeof script.name !== 'string') return false
    if (typeof script.file !== 'string') return false
  }

  return true
}

async function fetchGitHubFile(url: string, token: string | null): Promise<string> {
  const response = await fetch(url, { headers: buildFetchHeaders(token) })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('File not found (404). Check URL or token permissions.')
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('Access denied. Check your GitHub token.')
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data: GitHubContentsResponse = await response.json()
  return decodeBase64Content(data.content)
}

export async function fetchSourceConfig(parsed: ParsedGitHubUrl, token: string | null = null): Promise<SourceConfig> {
  const url = buildContentsApiUrl(parsed, CONFIG_FILE)
  const content = await fetchGitHubFile(url, token)
  const config = JSON.parse(content)

  if (!validateSourceConfig(config)) {
    throw new Error('Invalid config format')
  }
  return config
}

export async function fetchScriptFile(
  parsed: ParsedGitHubUrl,
  filePath: string,
  token: string | null = null,
): Promise<string> {
  const url = buildContentsApiUrl(parsed, filePath)
  return fetchGitHubFile(url, token)
}

export async function refreshSource(source: Source): Promise<Source> {
  const parsed = parseGitHubUrl(source.url)
  if (!parsed) {
    return {
      ...source,
      lastError: 'Invalid GitHub URL',
      lastFetched: Date.now(),
    }
  }

  try {
    const config = await fetchSourceConfig(parsed, source.token)

    const scripts: SourceScript[] = []
    for (const s of config.scripts) {
      const code = await fetchScriptFile(parsed, s.file, source.token)

      scripts.push({
        id: generateId(),
        name: s.name,
        code,
        autoRun: s.autoRun ?? false,
        domains: s.match?.domains ?? [],
        paths: s.match?.paths ?? [],
        enabled: true,
        sourceId: source.id,
        cspBypass: s.cspBypass,
      })
    }

    return {
      ...source,
      name: config.name,
      description: config.description ?? '',
      version: config.version,
      lastFetched: Date.now(),
      lastError: null,
      scripts,
      env: (config.env ?? []).map((e) => ({ key: e.key, description: e.description })),
      envValues: source.envValues ?? {},
    }
  } catch (err) {
    return {
      ...source,
      lastError: err instanceof Error ? err.message : 'Unknown error',
      lastFetched: Date.now(),
    }
  }
}

export function matchesDomainPattern(domain: string, pattern: string): boolean {
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1)
    return domain === pattern.slice(2) || domain.endsWith(suffix)
  }
  return domain === pattern
}

export function matchesPathPattern(path: string, patterns: string[]): boolean {
  if (patterns.length === 0) return true
  return patterns.some((pattern) => {
    if (pattern.startsWith('^')) {
      return new RegExp(pattern).test(path)
    }
    if (pattern.includes('*')) {
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
      const regex = new RegExp(`^${escaped}$`)
      return regex.test(path)
    }
    return path.startsWith(pattern)
  })
}

export function getMatchingSourceScripts(sources: Source[], domain: string, path: string): SourceScript[] {
  return sources
    .filter((s) => s.enabled)
    .flatMap((s) => s.scripts)
    .filter(
      (script) =>
        script.enabled &&
        script.domains.some((d) => matchesDomainPattern(domain, d)) &&
        matchesPathPattern(path, script.paths),
    )
}

export function getDisplayUrl(url: string): string {
  try {
    const parsed = parseGitHubUrl(url)
    if (!parsed) return url
    const pathPart = parsed.path ? `/${parsed.path}` : ''
    return `${parsed.owner}/${parsed.repo}${pathPart}`
  } catch {
    return url
  }
}
