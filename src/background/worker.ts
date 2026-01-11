import { type HeaderKey, type Settings, DEFAULT_SETTINGS } from '../types'

let isUpdating = false

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings ?? DEFAULT_SETTINGS
}

function getEnabledDomains(settings: Settings): string[] {
  if (!settings.enabled) return []
  return settings.sites.filter((s) => s.enabled).map((s) => s.domain)
}

function getEnabledHeaders(settings: Settings): HeaderKey[] {
  return (Object.entries(settings.headers) as [HeaderKey, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([header]) => header)
}

function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function isDomainInList(domain: string, domains: string[]): boolean {
  return domains.some((d) => domain === d || domain === `www.${d}` || domain.endsWith(`.${d}`))
}

type IconState = 'active' | 'outline' | 'disabled'

async function updateIconForTab(tabId: number, url: string | undefined): Promise<void> {
  const settings = await getSettings()
  const enabledDomains = getEnabledDomains(settings)

  let state: IconState = 'disabled'

  if (settings.enabled) {
    const domain = url ? extractDomain(url) : null
    if (domain && isDomainInList(domain, enabledDomains)) {
      state = 'active'
    } else {
      state = 'outline'
    }
  }

  const suffix = state === 'active' ? '' : `-${state}`
  await chrome.action.setIcon({
    tabId,
    path: {
      16: `icons/icon-16${suffix}.png`,
      32: `icons/icon-32${suffix}.png`,
      48: `icons/icon-48${suffix}.png`,
      128: `icons/icon-128${suffix}.png`,
    },
  })
}

async function updateAllTabsIcons(): Promise<void> {
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      await updateIconForTab(tab.id, tab.url)
    }
  }
}

async function updateRules(): Promise<void> {
  if (isUpdating) return
  isUpdating = true

  try {
    const settings = await getSettings()
    const domains = getEnabledDomains(settings)
    const headers = getEnabledHeaders(settings)

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
    })

    if (!settings.enabled || domains.length === 0 || headers.length === 0) {
      await updateAllTabsIcons()
      return
    }

    const initiatorDomains = domains.flatMap((d) => [d, `www.${d}`])
    const requestDomains = domains.flatMap((d) => [d, `*.${d}`])

    const rule: chrome.declarativeNetRequest.Rule = {
      id: 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        responseHeaders: headers.map((header) => ({
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header,
        })),
      },
      condition: {
        initiatorDomains,
        requestDomains,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
        ],
      },
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule],
    })

    await updateAllTabsIcons()
  } finally {
    isUpdating = false
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    updateRules()
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateIconForTab(tabId, tab.url)
  }
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  updateIconForTab(activeInfo.tabId, tab.url)
})

chrome.runtime.onInstalled.addListener(() => {
  updateRules()
})

updateRules()
