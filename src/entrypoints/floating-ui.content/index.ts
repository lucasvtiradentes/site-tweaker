import { mount, unmount } from 'svelte'
import App from './App.svelte'
import styles from './style.css?inline'

interface Script {
  id: string
  name: string
  type: 'js' | 'css'
  enabled: boolean
  autoRun: boolean
}

interface SourceScript {
  id: string
  name: string
  type: 'js' | 'css'
  autoRun: boolean
  enabled: boolean
  sourceId: string
}

interface Site {
  id: string
  domain: string
  enabled: boolean
  scripts: Script[]
}

interface SiteData {
  site: Site | null
  scripts: Script[]
  sourceScripts: SourceScript[]
}

const CONTAINER_ID = 'wc-floating-ui'

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

async function getSiteData(): Promise<SiteData | null> {
  const url = new URL(window.location.href)
  const path = url.pathname + url.search
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'GET_SITE_DATA',
        domain: extractDomain(window.location.href),
        path,
      },
      (response) => {
        resolve(response ?? null)
      },
    )
  })
}

let appInstance: ReturnType<typeof mount> | null = null
let container: HTMLElement | null = null

function removeFloatingUI(): void {
  if (appInstance && container) {
    unmount(appInstance)
    appInstance = null
  }
  const existing = document.getElementById(CONTAINER_ID)
  if (existing) existing.remove()
  container = null
}

function createFloatingUI(siteData: SiteData): void {
  if (document.getElementById(CONTAINER_ID)) return

  container = document.createElement('div')
  container.id = CONTAINER_ID
  container.style.cssText =
    'position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 2147483647 !important;'

  const shadow = container.attachShadow({ mode: 'open' })

  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  shadow.appendChild(styleEl)

  const appContainer = document.createElement('div')
  appContainer.id = 'app'
  shadow.appendChild(appContainer)

  document.documentElement.appendChild(container)

  appInstance = mount(App, {
    target: appContainer,
    props: { siteData },
  })
}

async function init(): Promise<void> {
  const siteData = await getSiteData()

  if (!siteData) {
    removeFloatingUI()
    return
  }

  const manualScripts = siteData.scripts.filter((s) => !s.autoRun && s.enabled)
  const manualSourceScripts = (siteData.sourceScripts || []).filter((s) => !s.autoRun && s.enabled)

  if (manualScripts.length === 0 && manualSourceScripts.length === 0) {
    removeFloatingUI()
    return
  }

  createFloatingUI(siteData)
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }

    chrome.storage.onChanged.addListener(() => {
      init()
    })
  },
})
