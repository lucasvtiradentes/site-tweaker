import { DEFAULT_SETTINGS, type HeaderKey, type Settings, type Site } from '../configs'

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings ?? DEFAULT_SETTINGS
}

async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings })
}

const globalToggle = document.getElementById('globalToggle') as HTMLButtonElement
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement
const mainView = document.getElementById('mainView') as HTMLDivElement
const settingsView = document.getElementById('settingsView') as HTMLDivElement
const sitesList = document.getElementById('sitesList') as HTMLUListElement
const noSites = document.getElementById('noSites') as HTMLParagraphElement
const headerList = document.getElementById('headerList') as HTMLUListElement
const backBtn = document.getElementById('backBtn') as HTMLButtonElement
const openEditor = document.getElementById('openEditor') as HTMLButtonElement

function createToggleIcon(enabled: boolean): string {
  if (enabled) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
      <rect x="1" y="5" width="22" height="14" rx="7" fill="#4ade80"/>
      <circle cx="16" cy="12" r="4" fill="#fff"/>
    </svg>`
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
    <rect x="1" y="5" width="22" height="14" rx="7" fill="#444"/>
    <circle cx="8" cy="12" r="4" fill="#888"/>
  </svg>`
}

async function renderSitesList(): Promise<void> {
  const settings = await getSettings()
  sitesList.innerHTML = ''

  if (settings.sites.length === 0) {
    noSites.classList.remove('hidden')
    return
  }

  noSites.classList.add('hidden')

  for (const site of settings.sites) {
    const scriptCount = site.scripts.length
    const li = document.createElement('li')
    li.className = 'site-item'
    li.innerHTML = `
      <div class="site-info">
        <span class="site-domain">${site.domain}</span>
        <span class="site-meta">${scriptCount} script${scriptCount !== 1 ? 's' : ''}</span>
      </div>
      <div class="site-actions">
        <button class="csp-btn ${site.cspEnabled ? 'enabled' : ''}" data-site-id="${site.id}" title="Toggle CSP bypass">
          CSP
        </button>
      </div>
    `
    sitesList.appendChild(li)
  }

  for (const btn of Array.from(sitesList.querySelectorAll('.csp-btn'))) {
    btn.addEventListener('click', async (e: Event) => {
      e.stopPropagation()
      const siteId = (e.currentTarget as HTMLButtonElement).dataset.siteId
      if (!siteId) return
      const settings = await getSettings()
      const site = settings.sites.find((s) => s.id === siteId)
      if (site) {
        site.cspEnabled = !site.cspEnabled
        await saveSettings(settings)
        await renderSitesList()
      }
    })
  }
}

function renderHeaderList(headers: Settings['headers']): void {
  headerList.innerHTML = ''
  const entries = Object.entries(headers) as [HeaderKey, boolean][]

  for (const [header, enabled] of entries) {
    const li = document.createElement('li')
    li.className = 'header-item'
    li.innerHTML = `
      <span class="header-name">${header}</span>
      <button class="toggle-btn ${enabled ? 'enabled' : ''}" data-header="${header}">
        ${createToggleIcon(enabled)}
      </button>
    `
    headerList.appendChild(li)
  }

  for (const btn of Array.from(headerList.querySelectorAll('.toggle-btn'))) {
    btn.addEventListener('click', async (e: Event) => {
      const header = (e.currentTarget as HTMLButtonElement).dataset.header as HeaderKey
      if (!header) return
      const settings = await getSettings()
      settings.headers[header] = !settings.headers[header]
      await saveSettings(settings)
      renderHeaderList(settings.headers)
    })
  }
}

async function updateGlobalToggleState(): Promise<void> {
  const settings = await getSettings()
  globalToggle.classList.toggle('active', settings.enabled)
}

globalToggle.addEventListener('click', async () => {
  const settings = await getSettings()
  settings.enabled = !settings.enabled
  await saveSettings(settings)
  await updateGlobalToggleState()
})

settingsBtn.addEventListener('click', async () => {
  mainView.classList.add('hidden')
  settingsView.classList.remove('hidden')
  const settings = await getSettings()
  renderHeaderList(settings.headers)
})

backBtn.addEventListener('click', () => {
  settingsView.classList.add('hidden')
  mainView.classList.remove('hidden')
})

openEditor.addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
})

async function init(): Promise<void> {
  await updateGlobalToggleState()
  await renderSitesList()
}

init()
