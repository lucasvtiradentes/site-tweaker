import { DEFAULT_SETTINGS, type HeaderKey, type Script, type Settings } from '../configs'

let isUpdating = false

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings ?? DEFAULT_SETTINGS
}

function getEnabledCspDomains(settings: Settings): string[] {
  if (!settings.enabled) return []
  return settings.sites.filter((s) => s.enabled && s.cspEnabled).map((s) => s.domain)
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

function matchesUrlPatterns(url: string, patterns: string[]): boolean {
  if (patterns.length === 0) return true
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname + urlObj.search
    return patterns.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
        return regex.test(path)
      }
      return path.startsWith(pattern)
    })
  } catch {
    return false
  }
}

type IconState = 'active' | 'outline' | 'disabled'

async function updateIconForTab(tabId: number, url: string | undefined): Promise<void> {
  const settings = await getSettings()

  let state: IconState = 'disabled'

  if (settings.enabled) {
    const domain = url ? extractDomain(url) : null
    const site = domain ? settings.sites.find((s) => s.domain === domain && s.enabled) : null
    if (site) {
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

async function updateCspRules(): Promise<void> {
  if (isUpdating) return
  isUpdating = true

  try {
    const settings = await getSettings()
    const domains = getEnabledCspDomains(settings)
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

async function injectScript(tabId: number, script: Script): Promise<void> {
  try {
    if (script.type === 'css') {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: script.code,
      })
    } else {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (code: string) => {
          const fn = new Function(code)
          fn()
        },
        args: [script.code],
        world: 'MAIN',
      })
    }
  } catch (err) {
    console.error(`Failed to inject script ${script.name}:`, err)
  }
}

async function injectAutoRunScripts(tabId: number, url: string): Promise<void> {
  const settings = await getSettings()
  if (!settings.enabled) return

  const domain = extractDomain(url)
  if (!domain) return

  const site = settings.sites.find((s) => s.domain === domain && s.enabled)
  if (!site) return

  for (const script of site.scripts) {
    if (!script.enabled || !script.autoRun) continue
    if (!matchesUrlPatterns(url, script.urlPatterns)) continue
    await injectScript(tabId, script)
  }
}

async function executeManualScript(
  siteId: string,
  scriptId: string,
  tabId: number,
): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return { success: false, error: 'Site not found' }

  const script = site.scripts.find((s) => s.id === scriptId)
  if (!script) return { success: false, error: 'Script not found' }

  try {
    await injectScript(tabId, script)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    updateCspRules()
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateIconForTab(tabId, tab.url)
    injectAutoRunScripts(tabId, tab.url)
  } else if (changeInfo.url) {
    updateIconForTab(tabId, changeInfo.url)
  }
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  updateIconForTab(activeInfo.tabId, tab.url)
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'EXECUTE_SCRIPT') {
    const tabId = msg.tabId ?? sender.tab?.id
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab ID' })
      return true
    }
    executeManualScript(msg.siteId, msg.scriptId, tabId).then(sendResponse)
    return true
  }
  if (msg.type === 'GET_CURRENT_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0]
      if (tab?.url) {
        const domain = extractDomain(tab.url)
        sendResponse({ tabId: tab.id, url: tab.url, domain })
      } else {
        sendResponse({ tabId: null, url: null, domain: null })
      }
    })
    return true
  }
  if (msg.type === 'GET_SITE_DATA') {
    getSettings().then((settings) => {
      if (!settings.enabled) {
        sendResponse(null)
        return
      }
      const site = settings.sites.find((s) => s.domain === msg.domain && s.enabled)
      if (!site) {
        sendResponse(null)
        return
      }
      sendResponse({ site, scripts: site.scripts.filter((s) => s.enabled) })
    })
    return true
  }
})

chrome.runtime.onInstalled.addListener(() => {
  updateCspRules()
})

updateCspRules()
