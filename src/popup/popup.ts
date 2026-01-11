import { DEFAULT_SETTINGS, type HeaderKey, type Settings, type Site } from '../configs'

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings ?? DEFAULT_SETTINGS
}

async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings })
}

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, '')
  domain = domain.replace(/\/.*$/, '')
  domain = domain.replace(/^www\./, '')
  return domain
}

const globalToggle = document.getElementById('globalToggle') as HTMLButtonElement
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement
const mainView = document.getElementById('mainView') as HTMLDivElement
const settingsView = document.getElementById('settingsView') as HTMLDivElement
const siteInput = document.getElementById('siteInput') as HTMLInputElement
const addSiteBtn = document.getElementById('addSiteBtn') as HTMLButtonElement
const siteList = document.getElementById('siteList') as HTMLUListElement
const headerList = document.getElementById('headerList') as HTMLUListElement
const backBtn = document.getElementById('backBtn') as HTMLButtonElement
const emptyState = document.getElementById('emptyState') as HTMLParagraphElement

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

function createDeleteIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`
}

function renderSiteList(sites: Site[]): void {
  siteList.innerHTML = ''
  emptyState.classList.toggle('hidden', sites.length > 0)

  for (const site of sites) {
    const li = document.createElement('li')
    li.className = 'site-item'
    li.innerHTML = `
      <div class="site-info">
        <span class="site-domain">${site.domain}</span>
      </div>
      <div class="site-actions">
        <button class="toggle-btn ${site.enabled ? 'enabled' : ''}" data-domain="${site.domain}" title="${site.enabled ? 'Disable' : 'Enable'}">
          ${createToggleIcon(site.enabled)}
        </button>
        <button class="delete-btn" data-domain="${site.domain}" title="Remove">
          ${createDeleteIcon()}
        </button>
      </div>
    `
    siteList.appendChild(li)
  }

  for (const btn of Array.from(siteList.querySelectorAll('.toggle-btn'))) {
    btn.addEventListener('click', async (e: Event) => {
      const domain = (e.currentTarget as HTMLButtonElement).dataset.domain
      if (!domain) return
      const settings = await getSettings()
      const site = settings.sites.find((s) => s.domain === domain)
      if (site) {
        site.enabled = !site.enabled
        await saveSettings(settings)
        renderSiteList(settings.sites)
      }
    })
  }

  for (const btn of Array.from(siteList.querySelectorAll('.delete-btn'))) {
    btn.addEventListener('click', async (e: Event) => {
      const domain = (e.currentTarget as HTMLButtonElement).dataset.domain
      if (!domain) return
      const settings = await getSettings()
      settings.sites = settings.sites.filter((s) => s.domain !== domain)
      await saveSettings(settings)
      renderSiteList(settings.sites)
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

async function addSite(): Promise<void> {
  const domain = normalizeDomain(siteInput.value)
  if (!domain) return

  const settings = await getSettings()
  const exists = settings.sites.some((s) => s.domain === domain)
  if (!exists) {
    settings.sites.push({ domain, enabled: true })
    await saveSettings(settings)
    renderSiteList(settings.sites)
  }
  siteInput.value = ''
}

addSiteBtn.addEventListener('click', addSite)
siteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addSite()
})

async function init(): Promise<void> {
  const settings = await getSettings()
  await updateGlobalToggleState()
  renderSiteList(settings.sites)
}

init()
