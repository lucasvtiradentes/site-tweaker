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

function createStyles(): string {
  return `
    #${CONTAINER_ID} {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
    }

    #${CONTAINER_ID} * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .wc-trigger {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1a1a2e;
      border: 2px solid #4ade80;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s;
    }

    .wc-trigger:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .wc-trigger svg {
      width: 24px;
      height: 24px;
      color: #4ade80;
    }

    .wc-panel {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 280px;
      background: #1a1a2e;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      display: none;
    }

    .wc-panel.open {
      display: block;
      animation: wc-slide-up 0.2s ease-out;
    }

    @keyframes wc-slide-up {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .wc-panel-header {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .wc-panel-title {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }

    .wc-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #888;
      transition: color 0.2s;
    }

    .wc-close-btn:hover {
      color: #fff;
    }

    .wc-scripts-list {
      list-style: none;
      max-height: 300px;
      overflow-y: auto;
      padding: 8px;
    }

    .wc-script-item {
      margin-bottom: 4px;
    }

    .wc-script-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #ccc;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .wc-script-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .wc-script-btn:active {
      background: rgba(74, 222, 128, 0.2);
      border-color: #4ade80;
    }

    .wc-script-btn.running {
      opacity: 0.5;
      pointer-events: none;
    }

    .wc-script-btn svg {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }

    .wc-script-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wc-script-type {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.1);
      color: #888;
    }

    .wc-script-type.css {
      background: rgba(147, 51, 234, 0.2);
      color: #a78bfa;
    }

    .wc-empty {
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 13px;
    }
  `
}

function createPlayIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`
}

function createCloseIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`
}

function createTriggerIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25C16.6 22.15 20 17.25 20 12V6l-8-4z"/>
    <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

async function executeScript(siteId: string, scriptId: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_SCRIPT', siteId, scriptId, tabId: null }, (response) => {
      resolve(response?.success ?? false)
    })
  })
}

function renderScriptsList(container: HTMLElement, siteData: SiteData): void {
  const listContainer = container.querySelector('.wc-scripts-list') as HTMLUListElement
  listContainer.innerHTML = ''

  const manualScripts = siteData.scripts.filter((s) => !s.autoRun && s.enabled)

  if (manualScripts.length === 0) {
    listContainer.innerHTML = '<li class="wc-empty">No manual scripts</li>'
    return
  }

  for (const script of manualScripts) {
    const li = document.createElement('li')
    li.className = 'wc-script-item'

    const typeClass = script.type === 'css' ? 'css' : ''

    li.innerHTML = `
      <button class="wc-script-btn" data-script-id="${script.id}">
        ${createPlayIcon()}
        <span class="wc-script-name">${script.name}</span>
        <span class="wc-script-type ${typeClass}">${script.type.toUpperCase()}</span>
      </button>
    `

    const btn = li.querySelector('.wc-script-btn') as HTMLButtonElement
    btn.addEventListener('click', async () => {
      btn.classList.add('running')
      await executeScript(siteData.site.id, script.id)
      setTimeout(() => btn.classList.remove('running'), 300)
    })

    listContainer.appendChild(li)
  }
}

function createFloatingUI(siteData: SiteData): void {
  if (document.getElementById(CONTAINER_ID)) return

  const style = document.createElement('style')
  style.textContent = createStyles()
  document.head.appendChild(style)

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  container.innerHTML = `
    <div class="wc-panel">
      <div class="wc-panel-header">
        <span class="wc-panel-title">Scripts</span>
        <button class="wc-close-btn">${createCloseIcon()}</button>
      </div>
      <ul class="wc-scripts-list"></ul>
    </div>
    <button class="wc-trigger">${createTriggerIcon()}</button>
  `

  const panel = container.querySelector('.wc-panel') as HTMLDivElement
  const trigger = container.querySelector('.wc-trigger') as HTMLButtonElement
  const closeBtn = container.querySelector('.wc-close-btn') as HTMLButtonElement

  trigger.addEventListener('click', () => {
    panel.classList.toggle('open')
    if (panel.classList.contains('open')) {
      renderScriptsList(container, siteData)
    }
  })

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open')
  })

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      panel.classList.remove('open')
    }
  })

  document.body.appendChild(container)
}

function removeFloatingUI(): void {
  const existing = document.getElementById(CONTAINER_ID)
  if (existing) existing.remove()
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

chrome.storage.onChanged.addListener(() => {
  init()
})
