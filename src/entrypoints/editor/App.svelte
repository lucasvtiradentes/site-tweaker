<script lang="ts">
import {
  type Script,
  type Settings,
  type Site,
  type Source,
  type SourceScript,
  createScript,
  createSite,
} from '../../lib/configs'
import {
  addSource as addSourceToStorage,
  getSettings,
  refreshAllSources,
  refreshSource,
  removeSource,
  saveSettings,
  toggleSource,
  toggleSourceScript,
  updateSourceToken,
} from '../../lib/storage'
import { normalizeDomain } from '../../lib/utils'
import AddSiteModal from './components/AddSiteModal.svelte'
import AddSourceModal from './components/AddSourceModal.svelte'
import ScriptEditor from './components/ScriptEditor.svelte'
import SettingsPanel from './components/SettingsPanel.svelte'
import Sidebar from './components/Sidebar.svelte'
import SitePanel from './components/SitePanel.svelte'
import SourceDetails from './components/SourceDetails.svelte'
import SourcesPanel from './components/SourcesPanel.svelte'

let settings = $state<Settings | null>(null)
let currentView = $state<'settings' | 'site' | 'sources' | 'source'>('settings')
let currentSiteId = $state<string | null>(null)
let currentSourceId = $state<string | null>(null)
let currentScriptId = $state<string | null>(null)
let viewingSourceScript = $state<SourceScript | null>(null)
let isNewScript = $state(false)
let showAddSiteModal = $state(false)
let showAddSourceModal = $state(false)

const currentSite = $derived(settings?.sites.find((s) => s.id === currentSiteId) ?? null)
const currentScript = $derived(currentSite?.scripts.find((s) => s.id === currentScriptId) ?? null)
const currentSource = $derived(settings?.sources.find((s) => s.id === currentSourceId) ?? null)

const currentSiteSourceScripts = $derived<SourceScript[]>(() => {
  if (!settings || !currentSite) return []
  const domain = currentSite.domain
  return settings.sources
    .filter((s) => s.enabled)
    .flatMap((s) => s.scripts)
    .filter((script) =>
      script.domains.some((d) => {
        const cleanDomain = d.replace(/^\*\./, '')
        return cleanDomain === domain
      }),
    )
})

$effect(() => {
  loadSettings()
})

async function loadSettings() {
  settings = await getSettings()
}

function selectSettings() {
  currentView = 'settings'
  currentSiteId = null
  currentSourceId = null
  currentScriptId = null
  isNewScript = false
}

function selectSources() {
  currentView = 'sources'
  currentSiteId = null
  currentSourceId = null
  currentScriptId = null
  isNewScript = false
}

function selectSource(sourceId: string) {
  currentView = 'source'
  currentSourceId = sourceId
  currentSiteId = null
  currentScriptId = null
  isNewScript = false
}

function selectSite(siteId: string) {
  currentView = 'site'
  currentSiteId = siteId
  currentSourceId = null
  currentScriptId = null
  viewingSourceScript = null
  isNewScript = false
}

function selectScript(scriptId: string) {
  currentScriptId = scriptId
  viewingSourceScript = null
  isNewScript = false
}

function selectSourceScript(script: SourceScript) {
  viewingSourceScript = script
  currentScriptId = null
  isNewScript = false
}

function clearScriptView() {
  currentScriptId = null
  viewingSourceScript = null
  isNewScript = false
}

function addScript() {
  isNewScript = true
  currentScriptId = null
  viewingSourceScript = null
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

async function handleSelectDomain(domain: string) {
  if (!settings) return
  const existing = settings.sites.find((s) => s.domain === domain)
  if (existing) {
    selectSite(existing.id)
    return
  }

  const newSite = createSite(domain)
  settings.sites.push(newSite)
  await saveSettings(settings)
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

async function handleAddSource(url: string, token: string | null) {
  if (!settings) return
  const newSource = await addSourceToStorage(url, token)
  await loadSettings()
  showAddSourceModal = false
  selectSource(newSource.id)
}

async function deleteSource(sourceId: string) {
  if (!settings) return
  const source = settings.sources.find((s) => s.id === sourceId)
  if (!source) return
  if (!confirm(`Delete source "${source.name || 'Unnamed'}" and all its scripts?`)) return

  await removeSource(sourceId)
  await loadSettings()
  if (currentSourceId === sourceId) {
    selectSources()
  }
}

async function handleToggleSource(sourceId: string) {
  await toggleSource(sourceId)
  await loadSettings()
}

async function handleRefreshSource() {
  if (!currentSourceId) return
  await refreshSource(currentSourceId)
  await loadSettings()
}

async function handleRefreshAllSources() {
  await refreshAllSources()
  await loadSettings()
}

async function handleToggleSourceScript(scriptId: string) {
  if (!currentSourceId) return
  await toggleSourceScript(currentSourceId, scriptId)
  await loadSettings()
}

async function handleToggleSourceScriptFromSite(sourceId: string, scriptId: string) {
  await toggleSourceScript(sourceId, scriptId)
  await loadSettings()
}

async function handleUpdateSourceToken(token: string | null) {
  if (!currentSourceId) return
  await updateSourceToken(currentSourceId, token)
  await loadSettings()
}
</script>

<div class="flex h-screen bg-[#0f0f1a] text-gray-100 font-sans text-sm overflow-hidden">
  <aside class="w-[250px] bg-[#1a1a2e] border-r border-white/10 flex flex-col">
    {#if settings}
      <Sidebar
        sites={settings.sites}
        sources={settings.sources}
        {currentView}
        {currentSiteId}
        onSelectSettings={selectSettings}
        onSelectSite={selectSite}
        onSelectDomain={handleSelectDomain}
        onSelectSources={selectSources}
        onAddSite={() => showAddSiteModal = true}
      />
    {/if}
  </aside>

  <main class="flex-1 flex flex-col overflow-hidden">
    {#if settings}
      {#if currentView === 'settings'}
        <SettingsPanel {settings} onUpdate={loadSettings} />
      {:else if currentView === 'sources'}
        <SourcesPanel
          sources={settings.sources}
          onSelectSource={selectSource}
          onAddSource={() => showAddSourceModal = true}
          onDeleteSource={deleteSource}
          onToggleSource={handleToggleSource}
          onRefreshAll={handleRefreshAllSources}
        />
      {:else if currentView === 'source' && currentSource}
        {#if viewingSourceScript}
          <div class="flex items-center gap-3 p-4 px-6 border-b border-white/10 bg-[#1a1a2e]">
            <button onclick={clearScriptView} aria-label="Go back" class="text-gray-500 hover:text-white transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="text-gray-500 text-[13px]">{currentSource.name}</span>
            <span class="text-gray-600">/</span>
            <span class="text-white font-medium">{viewingSourceScript.name}</span>
          </div>
          <ScriptEditor script={null} sourceScript={viewingSourceScript} isNew={false} readonly onSave={() => {}} onDelete={() => {}} onCancel={clearScriptView} onToggleEnabled={() => {}} />
        {:else}
          <SourceDetails
            source={currentSource}
            onBack={selectSources}
            onRefresh={handleRefreshSource}
            onSelectScript={selectSourceScript}
            onToggleScript={handleToggleSourceScript}
            onUpdateToken={handleUpdateSourceToken}
          />
        {/if}
      {:else if currentSite}
        {#if currentScript || isNewScript || viewingSourceScript}
          <div class="flex items-center gap-3 p-4 px-6 border-b border-white/10 bg-[#1a1a2e]">
            <button
              onclick={clearScriptView}
              aria-label="Go back"
              class="text-gray-500 hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="text-gray-500 text-[13px]">{currentSite.domain}</span>
            <span class="text-gray-600">/</span>
            <span class="text-white font-medium">
              {isNewScript ? 'New Script' : viewingSourceScript?.name ?? currentScript?.name}
            </span>
            {#if viewingSourceScript}
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">SRC</span>
            {/if}
          </div>
          <ScriptEditor
            script={currentScript}
            sourceScript={viewingSourceScript}
            isNew={isNewScript}
            readonly={!!viewingSourceScript}
            onSave={saveScript}
            onDelete={deleteScript}
            onCancel={clearScriptView}
            onToggleEnabled={toggleCurrentScriptEnabled}
          />
        {:else}
          <SitePanel
            site={currentSite}
            sourceScripts={currentSiteSourceScripts()}
            onSelectScript={selectScript}
            onSelectSourceScript={selectSourceScript}
            onAddScript={addScript}
            onDeleteScript={deleteScriptFromList}
            onToggleScript={toggleScript}
            onToggleSourceScript={handleToggleSourceScriptFromSite}
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

{#if showAddSourceModal}
  <AddSourceModal
    onConfirm={handleAddSource}
    onCancel={() => showAddSourceModal = false}
  />
{/if}
