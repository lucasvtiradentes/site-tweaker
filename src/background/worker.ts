import { type HeaderKey, type Settings, DEFAULT_SETTINGS } from '../types'

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

async function updateRules(): Promise<void> {
  const settings = await getSettings()
  const domains = getEnabledDomains(settings)
  const headers = getEnabledHeaders(settings)

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingIds = existingRules.map((r) => r.id)

  if (existingIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
    })
  }

  if (!settings.enabled || domains.length === 0 || headers.length === 0) {
    await updateIcon(false)
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

  await updateIcon(true)
}

async function updateIcon(enabled: boolean): Promise<void> {
  const suffix = enabled ? '' : '-disabled'
  await chrome.action.setIcon({
    path: {
      16: `icons/icon-16${suffix}.png`,
      32: `icons/icon-32${suffix}.png`,
      48: `icons/icon-48${suffix}.png`,
      128: `icons/icon-128${suffix}.png`,
    },
  })
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    updateRules()
  }
})

chrome.runtime.onInstalled.addListener(() => {
  updateRules()
})

updateRules()
