export interface Script {
  id: string
  name: string
  code: string
  enabled: boolean
  autoRun: boolean
  urlPatterns: string[]
}

export interface SourceScript {
  id: string
  name: string
  code: string
  autoRun: boolean
  domains: string[]
  paths: string[]
  enabled: boolean
  sourceId: string
}

export interface EnvVar {
  key: string
  description?: string
}

export interface Source {
  id: string
  url: string
  token: string | null
  name: string
  description: string
  enabled: boolean
  lastFetched: number | null
  lastError: string | null
  version: string
  scripts: SourceScript[]
  env: EnvVar[]
  envValues: Record<string, string>
}

export interface Site {
  id: string
  domain: string
  enabled: boolean
  cspEnabled: boolean
  scripts: Script[]
}

export interface Headers {
  'content-security-policy': boolean
  'content-security-policy-report-only': boolean
  'x-webkit-csp': boolean
  'x-content-security-policy': boolean
  'x-content-security-policy-report-only': boolean
  'x-webkit-csp-report-only': boolean
  'report-to': boolean
  'reporting-endpoints': boolean
}

export interface Settings {
  enabled: boolean
  floatingUiEnabled: boolean
  autoInjectEnabled: boolean
  headers: Headers
  sites: Site[]
  sources: Source[]
}

export const DEFAULT_HEADERS: Headers = {
  'content-security-policy': true,
  'content-security-policy-report-only': true,
  'x-webkit-csp': true,
  'x-content-security-policy': true,
  'x-content-security-policy-report-only': true,
  'x-webkit-csp-report-only': true,
  'report-to': true,
  'reporting-endpoints': true,
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  floatingUiEnabled: true,
  autoInjectEnabled: true,
  headers: DEFAULT_HEADERS,
  sites: [],
  sources: [],
}

export type HeaderKey = keyof Headers

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function createScript(partial: Partial<Script> = {}): Script {
  return {
    id: generateId(),
    name: 'New Script',
    code: '',
    enabled: true,
    autoRun: false,
    urlPatterns: [],
    ...partial,
  }
}

export function createSite(domain: string): Site {
  return {
    id: generateId(),
    domain,
    enabled: true,
    cspEnabled: false,
    scripts: [],
  }
}

export function createSource(url: string, token: string | null = null): Source {
  return {
    id: generateId(),
    url,
    token,
    name: '',
    description: '',
    enabled: true,
    lastFetched: null,
    lastError: null,
    version: '',
    scripts: [],
    env: [],
    envValues: {},
  }
}
