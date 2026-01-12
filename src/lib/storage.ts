import {
  DEFAULT_SETTINGS,
  type Script,
  type Settings,
  type Site,
  type Source,
  type SourceScript,
  createScript,
  createSite,
  createSource,
} from './configs'
import { refreshSource as fetchAndRefreshSource, getMatchingSourceScripts } from './sources'
import { normalizeDomain } from './utils'

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  const stored = result.settings
  if (!stored || !Array.isArray(stored.sites)) {
    return DEFAULT_SETTINGS
  }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    sites: stored.sites ?? [],
    sources: stored.sources ?? [],
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const plainSettings = JSON.parse(JSON.stringify(settings))
  await chrome.storage.local.set({ settings: plainSettings })
}

type ToggleableKey = 'enabled' | 'floatingUiEnabled' | 'autoInjectEnabled'

async function toggleSettingKey(key: ToggleableKey): Promise<boolean> {
  const settings = await getSettings()
  settings[key] = !settings[key]
  await saveSettings(settings)
  return settings[key]
}

export function toggleGlobal(): Promise<boolean> {
  return toggleSettingKey('enabled')
}

export function toggleFloatingUi(): Promise<boolean> {
  return toggleSettingKey('floatingUiEnabled')
}

export function toggleAutoInject(): Promise<boolean> {
  return toggleSettingKey('autoInjectEnabled')
}

export async function getSiteByDomain(domain: string): Promise<Site | undefined> {
  const settings = await getSettings()
  const normalized = normalizeDomain(domain)
  return settings.sites.find((s) => s.domain === normalized)
}

export async function addSite(domain: string): Promise<Site> {
  const settings = await getSettings()
  const normalized = normalizeDomain(domain)
  const existing = settings.sites.find((s) => s.domain === normalized)
  if (existing) {
    return existing
  }
  const newSite = createSite(normalized)
  settings.sites.push(newSite)
  await saveSettings(settings)
  return newSite
}

export async function updateSite(siteId: string, updates: Partial<Site>): Promise<Site | null> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return null
  Object.assign(site, updates)
  await saveSettings(settings)
  return site
}

export async function removeSite(siteId: string): Promise<void> {
  const settings = await getSettings()
  settings.sites = settings.sites.filter((s) => s.id !== siteId)
  await saveSettings(settings)
}

export async function toggleSite(siteId: string): Promise<boolean> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (site) {
    site.enabled = !site.enabled
    await saveSettings(settings)
    return site.enabled
  }
  return false
}

export async function toggleSiteCsp(siteId: string): Promise<boolean> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (site) {
    site.cspEnabled = !site.cspEnabled
    await saveSettings(settings)
    return site.cspEnabled
  }
  return false
}

export async function addScript(siteId: string, script?: Partial<Script>): Promise<Script | null> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return null
  const newScript = createScript(script)
  site.scripts.push(newScript)
  await saveSettings(settings)
  return newScript
}

export async function updateScript(siteId: string, scriptId: string, updates: Partial<Script>): Promise<Script | null> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return null
  const script = site.scripts.find((s) => s.id === scriptId)
  if (!script) return null
  Object.assign(script, updates)
  await saveSettings(settings)
  return script
}

export async function removeScript(siteId: string, scriptId: string): Promise<void> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return
  site.scripts = site.scripts.filter((s) => s.id !== scriptId)
  await saveSettings(settings)
}

export async function toggleScript(siteId: string, scriptId: string): Promise<boolean> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return false
  const script = site.scripts.find((s) => s.id === scriptId)
  if (script) {
    script.enabled = !script.enabled
    await saveSettings(settings)
    return script.enabled
  }
  return false
}

export async function getScriptsForDomain(domain: string): Promise<{ site: Site; scripts: Script[] } | null> {
  const settings = await getSettings()
  if (!settings.enabled) return null
  const normalized = normalizeDomain(domain)
  const site = settings.sites.find((s) => s.domain === normalized && s.enabled)
  if (!site) return null
  return { site, scripts: site.scripts.filter((s) => s.enabled) }
}

export async function addSource(url: string, token: string | null = null): Promise<Source> {
  const settings = await getSettings()
  const existing = settings.sources.find((s) => s.url === url)
  if (existing) {
    return existing
  }
  const newSource = createSource(url, token)
  const refreshed = await fetchAndRefreshSource(newSource)
  settings.sources.push(refreshed)
  await saveSettings(settings)
  return refreshed
}

export async function removeSource(sourceId: string): Promise<void> {
  const settings = await getSettings()
  settings.sources = settings.sources.filter((s) => s.id !== sourceId)
  await saveSettings(settings)
}

export async function toggleSource(sourceId: string): Promise<boolean> {
  const settings = await getSettings()
  const source = settings.sources.find((s) => s.id === sourceId)
  if (source) {
    source.enabled = !source.enabled
    await saveSettings(settings)
    return source.enabled
  }
  return false
}

export async function refreshSource(sourceId: string): Promise<Source | null> {
  const settings = await getSettings()
  const index = settings.sources.findIndex((s) => s.id === sourceId)
  if (index === -1) return null
  const refreshed = await fetchAndRefreshSource(settings.sources[index])
  settings.sources[index] = refreshed
  await saveSettings(settings)
  return refreshed
}

export async function refreshAllSources(): Promise<void> {
  const settings = await getSettings()
  settings.sources = await Promise.all(settings.sources.map(fetchAndRefreshSource))
  await saveSettings(settings)
}

export async function toggleSourceScript(sourceId: string, scriptId: string): Promise<boolean> {
  const settings = await getSettings()
  const source = settings.sources.find((s) => s.id === sourceId)
  if (!source) return false
  const script = source.scripts.find((s) => s.id === scriptId)
  if (script) {
    script.enabled = !script.enabled
    await saveSettings(settings)
    return script.enabled
  }
  return false
}

export async function getSourceById(sourceId: string): Promise<Source | undefined> {
  const settings = await getSettings()
  return settings.sources.find((s) => s.id === sourceId)
}

export async function updateSourceToken(sourceId: string, token: string | null): Promise<Source | null> {
  const settings = await getSettings()
  const source = settings.sources.find((s) => s.id === sourceId)
  if (!source) return null
  source.token = token
  await saveSettings(settings)
  return source
}

export { getMatchingSourceScripts, normalizeDomain }
export type { Script, Settings, Site, Source, SourceScript }
