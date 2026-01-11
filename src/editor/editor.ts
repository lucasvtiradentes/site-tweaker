import { DEFAULT_SETTINGS, type Script, type Settings, type Site, createScript, createSite } from '../configs'

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

const sitesList = document.getElementById('sitesList') as HTMLUListElement
const noSites = document.getElementById('noSites') as HTMLParagraphElement
const noSiteSelected = document.getElementById('noSiteSelected') as HTMLDivElement
const siteEditor = document.getElementById('siteEditor') as HTMLDivElement
const siteDomain = document.getElementById('siteDomain') as HTMLHeadingElement
const scriptsList = document.getElementById('scriptsList') as HTMLUListElement
const noScriptsMsg = document.getElementById('noScriptsMsg') as HTMLParagraphElement
const scriptEditor = document.getElementById('scriptEditor') as HTMLDivElement

const addSiteBtn = document.getElementById('addSiteBtn') as HTMLButtonElement
const deleteSiteBtn = document.getElementById('deleteSiteBtn') as HTMLButtonElement
const addScriptBtn = document.getElementById('addScriptBtn') as HTMLButtonElement

const addSiteModal = document.getElementById('addSiteModal') as HTMLDivElement
const newSiteDomain = document.getElementById('newSiteDomain') as HTMLInputElement
const confirmAddSite = document.getElementById('confirmAddSite') as HTMLButtonElement
const cancelAddSite = document.getElementById('cancelAddSite') as HTMLButtonElement

const scriptName = document.getElementById('scriptName') as HTMLInputElement
const scriptType = document.getElementById('scriptType') as HTMLSelectElement
const scriptAutoRun = document.getElementById('scriptAutoRun') as HTMLSelectElement
const scriptRunAt = document.getElementById('scriptRunAt') as HTMLSelectElement
const scriptEnabled = document.getElementById('scriptEnabled') as HTMLSelectElement
const scriptUrlPatterns = document.getElementById('scriptUrlPatterns') as HTMLTextAreaElement
const scriptCode = document.getElementById('scriptCode') as HTMLTextAreaElement

const saveScriptBtn = document.getElementById('saveScriptBtn') as HTMLButtonElement
const deleteScriptBtn = document.getElementById('deleteScriptBtn') as HTMLButtonElement
const cancelScriptBtn = document.getElementById('cancelScriptBtn') as HTMLButtonElement

let currentSite: Site | null = null
let currentScript: Script | null = null
let isNewScript = false

async function renderSitesList(): Promise<void> {
  const settings = await getSettings()
  sitesList.innerHTML = ''

  if (settings.sites.length === 0) {
    noSites.classList.remove('hidden')
    return
  }

  noSites.classList.add('hidden')

  for (const site of settings.sites) {
    const li = document.createElement('li')
    li.className = `site-item ${currentSite?.id === site.id ? 'active' : ''}`
    li.dataset.siteId = site.id
    li.innerHTML = `
      <div class="domain">${site.domain}</div>
      <div class="script-count">${site.scripts.length} script${site.scripts.length !== 1 ? 's' : ''}</div>
    `
    li.addEventListener('click', () => selectSite(site.id))
    sitesList.appendChild(li)
  }
}

async function selectSite(siteId: string): Promise<void> {
  const settings = await getSettings()
  currentSite = settings.sites.find((s) => s.id === siteId) ?? null
  currentScript = null
  isNewScript = false

  if (!currentSite) {
    noSiteSelected.classList.remove('hidden')
    siteEditor.classList.add('hidden')
    return
  }

  noSiteSelected.classList.add('hidden')
  siteEditor.classList.remove('hidden')
  siteDomain.textContent = currentSite.domain

  await renderSitesList()
  renderScriptsList()
  hideScriptEditor()
}

function renderScriptsList(): void {
  scriptsList.innerHTML = ''

  if (!currentSite || currentSite.scripts.length === 0) {
    noScriptsMsg.classList.remove('hidden')
    return
  }

  noScriptsMsg.classList.add('hidden')

  for (const script of currentSite.scripts) {
    const li = document.createElement('li')
    li.className = `script-item ${currentScript?.id === script.id ? 'active' : ''}`
    li.dataset.scriptId = script.id

    const tags: string[] = []
    tags.push(`<span class="tag ${script.type}">${script.type.toUpperCase()}</span>`)
    if (script.autoRun) tags.push('<span class="tag auto">AUTO</span>')
    if (!script.enabled) tags.push('<span class="tag disabled">OFF</span>')

    li.innerHTML = `
      <span class="name">${script.name}</span>
      <div class="meta">${tags.join('')}</div>
    `
    li.addEventListener('click', () => selectScript(script.id))
    scriptsList.appendChild(li)
  }
}

function selectScript(scriptId: string): void {
  if (!currentSite) return
  currentScript = currentSite.scripts.find((s) => s.id === scriptId) ?? null
  isNewScript = false

  if (!currentScript) {
    hideScriptEditor()
    return
  }

  showScriptEditor()
  populateScriptForm(currentScript)
  renderScriptsList()
}

function showScriptEditor(): void {
  scriptEditor.classList.remove('hidden')
}

function hideScriptEditor(): void {
  scriptEditor.classList.add('hidden')
  currentScript = null
  isNewScript = false
}

function populateScriptForm(script: Script): void {
  scriptName.value = script.name
  scriptType.value = script.type
  scriptAutoRun.value = String(script.autoRun)
  scriptRunAt.value = script.runAt
  scriptEnabled.value = String(script.enabled)
  scriptUrlPatterns.value = script.urlPatterns.join('\n')
  scriptCode.value = script.code
}

function clearScriptForm(): void {
  scriptName.value = ''
  scriptType.value = 'js'
  scriptAutoRun.value = 'false'
  scriptRunAt.value = 'document_idle'
  scriptEnabled.value = 'true'
  scriptUrlPatterns.value = ''
  scriptCode.value = ''
}

function getScriptFromForm(): Partial<Script> {
  return {
    name: scriptName.value.trim() || 'Untitled Script',
    type: scriptType.value as 'js' | 'css',
    autoRun: scriptAutoRun.value === 'true',
    runAt: scriptRunAt.value as 'document_start' | 'document_end' | 'document_idle',
    enabled: scriptEnabled.value === 'true',
    urlPatterns: scriptUrlPatterns.value
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean),
    code: scriptCode.value,
  }
}

addSiteBtn.addEventListener('click', () => {
  addSiteModal.classList.remove('hidden')
  newSiteDomain.value = ''
  newSiteDomain.focus()
})

cancelAddSite.addEventListener('click', () => {
  addSiteModal.classList.add('hidden')
})

confirmAddSite.addEventListener('click', async () => {
  const domain = normalizeDomain(newSiteDomain.value)
  if (!domain) return

  const settings = await getSettings()
  const existing = settings.sites.find((s) => s.domain === domain)
  if (existing) {
    addSiteModal.classList.add('hidden')
    await selectSite(existing.id)
    return
  }

  const newSite = createSite(domain)
  settings.sites.push(newSite)
  await saveSettings(settings)
  addSiteModal.classList.add('hidden')
  await renderSitesList()
  await selectSite(newSite.id)
})

newSiteDomain.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') confirmAddSite.click()
})

deleteSiteBtn.addEventListener('click', async () => {
  if (!currentSite) return
  if (!confirm(`Delete site "${currentSite.domain}" and all its scripts?`)) return

  const settings = await getSettings()
  settings.sites = settings.sites.filter((s) => s.id !== currentSite?.id)
  await saveSettings(settings)

  currentSite = null
  currentScript = null
  noSiteSelected.classList.remove('hidden')
  siteEditor.classList.add('hidden')
  await renderSitesList()
})

addScriptBtn.addEventListener('click', () => {
  isNewScript = true
  currentScript = null
  clearScriptForm()
  showScriptEditor()
  renderScriptsList()
  scriptName.focus()
})

saveScriptBtn.addEventListener('click', async () => {
  if (!currentSite) return

  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === currentSite?.id)
  if (!site) return

  const formData = getScriptFromForm()

  if (isNewScript) {
    const newScript = createScript(formData)
    site.scripts.push(newScript)
    currentScript = newScript
    isNewScript = false
  } else if (currentScript) {
    const script = site.scripts.find((s) => s.id === currentScript?.id)
    if (script) {
      Object.assign(script, formData)
      currentScript = script
    }
  }

  currentSite = site
  await saveSettings(settings)
  renderScriptsList()
})

deleteScriptBtn.addEventListener('click', async () => {
  if (!currentSite || !currentScript) return
  if (!confirm(`Delete script "${currentScript.name}"?`)) return

  const settings = await getSettings()
  const site = settings.sites.find((s) => s.id === currentSite?.id)
  if (!site) return

  site.scripts = site.scripts.filter((s) => s.id !== currentScript?.id)
  currentSite = site
  await saveSettings(settings)

  hideScriptEditor()
  renderScriptsList()
})

cancelScriptBtn.addEventListener('click', () => {
  hideScriptEditor()
  renderScriptsList()
})

scriptCode.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = scriptCode.selectionStart
    const end = scriptCode.selectionEnd
    scriptCode.value = `${scriptCode.value.substring(0, start)}  ${scriptCode.value.substring(end)}`
    scriptCode.selectionStart = scriptCode.selectionEnd = start + 2
  }
})

async function init(): Promise<void> {
  await renderSitesList()
}

init()
