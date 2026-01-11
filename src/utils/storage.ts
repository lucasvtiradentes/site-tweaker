import { DEFAULT_SETTINGS, type Settings, type Site } from '../configs'

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings ?? DEFAULT_SETTINGS
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings })
}

export async function toggleGlobal(): Promise<boolean> {
  const settings = await getSettings()
  settings.enabled = !settings.enabled
  await saveSettings(settings)
  return settings.enabled
}

export async function toggleSite(domain: string): Promise<boolean> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.domain === domain)
  if (site) {
    site.enabled = !site.enabled
    await saveSettings(settings)
    return site.enabled
  }
  return false
}

export async function addSite(domain: string): Promise<Site> {
  const settings = await getSettings()
  const normalized = normalizeDomain(domain)
  const existing = settings.sites.find((s) => s.domain === normalized)
  if (existing) {
    return existing
  }
  const newSite: Site = { domain: normalized, enabled: true }
  settings.sites.push(newSite)
  await saveSettings(settings)
  return newSite
}

export async function removeSite(domain: string): Promise<void> {
  const settings = await getSettings()
  settings.sites = settings.sites.filter((s) => s.domain !== domain)
  await saveSettings(settings)
}

export function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, '')
  domain = domain.replace(/\/.*$/, '')
  domain = domain.replace(/^www\./, '')
  return domain
}
