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

interface Site {
  id: string
  domain: string
  enabled: boolean
  scripts: Script[]
}

interface SiteData {
  site: Site
  scripts: Script[]
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
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SITE_DATA', domain: extractDomain(window.location.href) }, (response) => {
      resolve(response ?? null)
    })
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

  const shadow = container.attachShadow({ mode: 'open' })

  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  shadow.appendChild(styleEl)

  const appContainer = document.createElement('div')
  appContainer.id = 'app'
  shadow.appendChild(appContainer)

  document.body.appendChild(container)

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
  if (manualScripts.length === 0) {
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
