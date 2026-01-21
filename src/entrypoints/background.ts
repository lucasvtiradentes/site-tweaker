import { DEFAULT_SETTINGS, type HeaderKey, type Script, type Settings, type SourceScript } from '../lib/configs'
import { MSG } from '../lib/messages'
import { getMatchingSourceScripts, matchesDomainPattern, matchesPathPattern } from '../lib/sources'
import { extractDomain } from '../lib/utils'

export default defineBackground(() => {
  let cspRulesPromise: Promise<void> | null = null

  async function getSettings(): Promise<Settings> {
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

  function getEnabledCspDomains(settings: Settings): string[] {
    if (!settings.enabled) return []
    return settings.sites.filter((s) => s.enabled && s.cspEnabled).map((s) => s.domain)
  }

  function getEnabledHeaders(settings: Settings): HeaderKey[] {
    return (Object.entries(settings.headers) as [HeaderKey, boolean][])
      .filter(([, enabled]) => enabled)
      .map(([header]) => header)
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

  function updateCspRules(): Promise<void> {
    if (cspRulesPromise) return cspRulesPromise

    cspRulesPromise = (async () => {
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

      const requestDomains = domains.flatMap((d) => [d, `www.${d}`])

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
    })()

    return cspRulesPromise
  }

  function refreshCspRules(): void {
    cspRulesPromise = null
    updateCspRules()
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

  async function injectScript(tabId: number, script: Script | SourceScript): Promise<void> {
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
    if (cspRulesPromise) await cspRulesPromise

    const settings = await getSettings()
    if (!settings.enabled || !settings.autoInjectEnabled) return

    const domain = extractDomain(url)
    if (!domain) return

    const urlObj = new URL(url)
    const path = urlObj.pathname + urlObj.search

    const site = settings.sites.find((s) => s.domain === domain && s.enabled)
    if (site) {
      for (const script of site.scripts) {
        if (!script.enabled || !script.autoRun) continue
        if (!matchesUrlPatterns(url, script.urlPatterns)) continue
        await injectScript(tabId, script)
      }
    }

    const sourceScripts = getMatchingSourceScripts(settings.sources, domain, path)
    for (const script of sourceScripts) {
      if (!script.autoRun) continue
      await injectScript(tabId, script)
    }
  }

  async function executeManualScript(
    siteId: string,
    scriptId: string,
    tabId: number,
  ): Promise<{ success: boolean; error?: string }> {
    if (cspRulesPromise) await cspRulesPromise

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

  async function executeSourceScript(
    sourceId: string,
    scriptId: string,
    tabId: number,
  ): Promise<{ success: boolean; error?: string }> {
    if (cspRulesPromise) await cspRulesPromise

    const settings = await getSettings()
    const source = settings.sources.find((s) => s.id === sourceId)
    if (!source) return { success: false, error: 'Source not found' }

    const script = source.scripts.find((s) => s.id === scriptId)
    if (!script) return { success: false, error: 'Script not found' }

    try {
      await injectScript(tabId, script)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  const MENU_PARENT_ID = 'site-tweaker-parent'
  const menuScriptMap = new Map<
    string,
    { type: 'site' | 'source'; siteId?: string; sourceId?: string; scriptId: string }
  >()

  async function updateContextMenu(tabId: number, url: string) {
    await chrome.contextMenus.removeAll()
    menuScriptMap.clear()

    const settings = await getSettings()
    if (!settings.enabled) return

    const domain = extractDomain(url)
    if (!domain) return

    let path = '/'
    try {
      const urlObj = new URL(url)
      path = urlObj.pathname + urlObj.search
    } catch {}

    const site = settings.sites.find((s) => s.domain === domain && s.enabled)
    const siteScripts = site ? site.scripts.filter((s) => s.enabled && !s.autoRun) : []
    const sourceScripts = getMatchingSourceScripts(settings.sources, domain, path).filter((s) => !s.autoRun)

    if (siteScripts.length === 0 && sourceScripts.length === 0) return

    chrome.contextMenus.create({
      id: MENU_PARENT_ID,
      title: 'Site Tweaker',
      contexts: ['page'],
    })

    for (const script of siteScripts) {
      const menuId = `site-script-${script.id}`
      menuScriptMap.set(menuId, { type: 'site', siteId: site?.id, scriptId: script.id })
      chrome.contextMenus.create({
        id: menuId,
        parentId: MENU_PARENT_ID,
        title: `${script.name} (${script.type.toUpperCase()})`,
        contexts: ['page'],
      })
    }

    for (const script of sourceScripts) {
      const menuId = `source-script-${script.id}`
      menuScriptMap.set(menuId, { type: 'source', sourceId: script.sourceId, scriptId: script.id })
      chrome.contextMenus.create({
        id: menuId,
        parentId: MENU_PARENT_ID,
        title: `${script.name} (SRC/${script.type.toUpperCase()})`,
        contexts: ['page'],
      })
    }
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      refreshCspRules()
    }
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      updateIconForTab(tabId, tab.url)
      injectAutoRunScripts(tabId, tab.url)
      if (tab.active) {
        updateContextMenu(tabId, tab.url)
      }
    } else if (changeInfo.url) {
      updateIconForTab(tabId, changeInfo.url)
    }
  })

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    updateIconForTab(activeInfo.tabId, tab.url)
    if (tab.url) {
      updateContextMenu(activeInfo.tabId, tab.url)
    }
  })

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === MSG.EXECUTE_SCRIPT) {
      const tabId = msg.tabId ?? sender.tab?.id
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' })
        return true
      }
      executeManualScript(msg.siteId, msg.scriptId, tabId).then(sendResponse)
      return true
    }
    if (msg.type === MSG.EXECUTE_SOURCE_SCRIPT) {
      const tabId = msg.tabId ?? sender.tab?.id
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' })
        return true
      }
      executeSourceScript(msg.sourceId, msg.scriptId, tabId).then(sendResponse)
      return true
    }
    if (msg.type === MSG.GET_CURRENT_TAB_INFO) {
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
    if (msg.type === MSG.GET_SITE_DATA) {
      getSettings().then((settings) => {
        if (!settings.enabled || !settings.floatingUiEnabled) {
          sendResponse(null)
          return
        }
        const site = settings.sites.find((s) => s.domain === msg.domain && s.enabled)
        const path = msg.path || '/'
        const sourceScripts = getMatchingSourceScripts(settings.sources, msg.domain, path)
        if (!site && sourceScripts.length === 0) {
          sendResponse(null)
          return
        }
        sendResponse({
          site,
          scripts: site ? site.scripts.filter((s) => s.enabled) : [],
          sourceScripts,
        })
      })
      return true
    }
  })

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id || !info.menuItemId) return
    const menuId = String(info.menuItemId)
    const scriptInfo = menuScriptMap.get(menuId)
    if (!scriptInfo) return

    if (scriptInfo.type === 'site' && scriptInfo.siteId) {
      await executeManualScript(scriptInfo.siteId, scriptInfo.scriptId, tab.id)
    } else if (scriptInfo.type === 'source' && scriptInfo.sourceId) {
      await executeSourceScript(scriptInfo.sourceId, scriptInfo.scriptId, tab.id)
    }
  })

  updateCspRules()
})
