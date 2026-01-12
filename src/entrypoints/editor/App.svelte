<script lang="ts">
import { type Script, type Settings, type Site, createScript, createSite } from '../../lib/configs'
import { getSettings, saveSettings } from '../../lib/storage'
import AddSiteModal from './components/AddSiteModal.svelte'
import ScriptEditor from './components/ScriptEditor.svelte'
import SettingsPanel from './components/SettingsPanel.svelte'
import Sidebar from './components/Sidebar.svelte'
import SitePanel from './components/SitePanel.svelte'

let settings = $state<Settings | null>(null)
let currentView = $state<'settings' | 'site'>('settings')
let currentSiteId = $state<string | null>(null)
let currentScriptId = $state<string | null>(null)
let isNewScript = $state(false)
let showAddSiteModal = $state(false)

const currentSite = $derived(settings?.sites.find((s) => s.id === currentSiteId) ?? null)
const currentScript = $derived(currentSite?.scripts.find((s) => s.id === currentScriptId) ?? null)

$effect(() => {
  loadSettings()
})

async function loadSettings() {
  settings = await getSettings()
}

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, '')
  domain = domain.replace(/\/.*$/, '')
  domain = domain.replace(/^www\./, '')
  return domain
}

function selectSettings() {
  currentView = 'settings'
  currentSiteId = null
  currentScriptId = null
  isNewScript = false
}

function selectSite(siteId: string) {
  currentView = 'site'
  currentSiteId = siteId
  currentScriptId = null
  isNewScript = false
}

function selectScript(scriptId: string) {
  currentScriptId = scriptId
  isNewScript = false
}

function addScript() {
  isNewScript = true
  currentScriptId = null
}

async function handleAddSite(domain: string) {
  if (!settings) return
  const normalized = normalizeDomain(domain)
  if (!normalized) return

  const existing = settings.sites.find((s) => s.domain === normalized)
  if (existing) {
    showAddSiteModal = false
    selectSite(existing.id)
    return
  }

  const newSite = createSite(normalized)
  settings.sites.push(newSite)
  await saveSettings(settings)
  showAddSiteModal = false
  selectSite(newSite.id)
}

async function deleteSite() {
  if (!settings || !currentSiteId) return
  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return
  if (!confirm(`Delete site "${site.domain}" and all its scripts?`)) return

  settings.sites = settings.sites.filter((s) => s.id !== currentSiteId)
  await saveSettings(settings)
  selectSettings()
}

async function toggleSiteCsp() {
  if (!settings || !currentSite) return
  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return
  site.cspEnabled = !site.cspEnabled
  await saveSettings(settings)
}

async function saveScript(scriptData: Partial<Script>) {
  if (!settings || !currentSiteId) return

  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return

  if (isNewScript) {
    const newScript = createScript(scriptData)
    site.scripts.push(newScript)
    await saveSettings(settings)
    currentScriptId = newScript.id
    isNewScript = false
  } else if (currentScriptId) {
    const script = site.scripts.find((s) => s.id === currentScriptId)
    if (script) {
      Object.assign(script, scriptData)
      await saveSettings(settings)
    }
  }
}

async function deleteScript() {
  if (!settings || !currentSiteId || !currentScriptId) return
  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return
  const script = site.scripts.find((s) => s.id === currentScriptId)
  if (!script) return
  if (!confirm(`Delete script "${script.name}"?`)) return

  site.scripts = site.scripts.filter((s) => s.id !== currentScriptId)
  await saveSettings(settings)
  currentScriptId = null
  isNewScript = false
}

async function deleteScriptFromList(scriptId: string) {
  if (!settings || !currentSiteId) return
  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return
  const script = site.scripts.find((s) => s.id === scriptId)
  if (!script) return
  if (!confirm(`Delete script "${script.name}"?`)) return

  site.scripts = site.scripts.filter((s) => s.id !== scriptId)
  await saveSettings(settings)

  if (currentScriptId === scriptId) {
    currentScriptId = null
    isNewScript = false
  }
}

async function toggleScript(scriptId: string) {
  if (!settings || !currentSiteId) return
  const site = settings.sites.find((s) => s.id === currentSiteId)
  if (!site) return
  const script = site.scripts.find((s) => s.id === scriptId)
  if (!script) return

  script.enabled = !script.enabled
  await saveSettings(settings)
}

async function toggleCurrentScriptEnabled() {
  if (!currentScriptId) return
  await toggleScript(currentScriptId)
}

function cancelEdit() {
  currentScriptId = null
  isNewScript = false
}
</script>

<div class="flex h-screen bg-[#0f0f1a] text-gray-100 font-sans text-sm overflow-hidden">
  <aside class="w-[250px] bg-[#1a1a2e] border-r border-white/10 flex flex-col">
    {#if settings}
      <Sidebar
        sites={settings.sites}
        {currentView}
        {currentSiteId}
        onSelectSettings={selectSettings}
        onSelectSite={selectSite}
        onAddSite={() => showAddSiteModal = true}
      />
    {/if}
  </aside>

  <main class="flex-1 flex flex-col overflow-hidden">
    {#if settings}
      {#if currentView === 'settings'}
        <SettingsPanel {settings} onUpdate={loadSettings} />
      {:else if currentSite}
        {#if currentScript || isNewScript}
          <div class="flex items-center gap-3 p-4 px-6 border-b border-white/10 bg-[#1a1a2e]">
            <button
              onclick={() => { currentScriptId = null; isNewScript = false }}
              aria-label="Go back"
              class="text-gray-500 hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="text-gray-500 text-[13px]">{currentSite.domain}</span>
            <span class="text-gray-600">/</span>
            <span class="text-white font-medium">{isNewScript ? 'New Script' : currentScript?.name}</span>
          </div>
          <ScriptEditor
            script={currentScript}
            isNew={isNewScript}
            onSave={saveScript}
            onDelete={deleteScript}
            onCancel={cancelEdit}
            onToggleEnabled={toggleCurrentScriptEnabled}
          />
        {:else}
          <SitePanel
            site={currentSite}
            onSelectScript={selectScript}
            onAddScript={addScript}
            onDeleteScript={deleteScriptFromList}
            onToggleScript={toggleScript}
            onToggleCsp={toggleSiteCsp}
            onDeleteSite={deleteSite}
          />
        {/if}
      {/if}
    {/if}
  </main>
</div>

{#if showAddSiteModal}
  <AddSiteModal
    onConfirm={handleAddSite}
    onCancel={() => showAddSiteModal = false}
  />
{/if}
