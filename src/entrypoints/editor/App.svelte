<script lang="ts">
import { type Script, type Settings, type Site, createScript, createSite } from '../../lib/configs'
import { getSettings, saveSettings } from '../../lib/storage'
import AddSiteModal from './components/AddSiteModal.svelte'
import ScriptEditor from './components/ScriptEditor.svelte'
import TreeView from './components/TreeView.svelte'

let settings = $state<Settings | null>(null)
let currentSite = $state<Site | null>(null)
let currentScript = $state<Script | null>(null)
let isNewScript = $state(false)
let showAddSiteModal = $state(false)

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

async function selectSite(siteId: string) {
  if (!settings) return
  currentSite = settings.sites.find((s) => s.id === siteId) ?? null
  currentScript = null
  isNewScript = false
}

function selectScript(siteId: string, scriptId: string) {
  if (!settings) return
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return
  currentSite = site
  currentScript = site.scripts.find((s) => s.id === scriptId) ?? null
  isNewScript = false
}

function addScript(siteId: string) {
  if (!settings) return
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return
  currentSite = site
  isNewScript = true
  currentScript = null
}

async function handleAddSite(domain: string) {
  if (!settings) return
  const normalized = normalizeDomain(domain)
  if (!normalized) return

  const existing = settings.sites.find((s) => s.domain === normalized)
  if (existing) {
    showAddSiteModal = false
    await selectSite(existing.id)
    return
  }

  const newSite = createSite(normalized)
  settings.sites.push(newSite)
  await saveSettings(settings)
  showAddSiteModal = false
  await selectSite(newSite.id)
}

async function deleteSite(siteId: string) {
  if (!settings) return
  const site = settings.sites.find((s) => s.id === siteId)
  if (!site) return
  if (!confirm(`Delete site "${site.domain}" and all its scripts?`)) return

  settings.sites = settings.sites.filter((s) => s.id !== siteId)
  await saveSettings(settings)

  if (currentSite?.id === siteId) {
    currentSite = null
    currentScript = null
  }
}

async function saveScript(scriptData: Partial<Script>) {
  if (!settings || !currentSite) return

  const site = settings.sites.find((s) => s.id === currentSite?.id)
  if (!site) return

  if (isNewScript) {
    const newScript = createScript(scriptData)
    site.scripts.push(newScript)
    currentScript = newScript
    isNewScript = false
  } else if (currentScript) {
    const script = site.scripts.find((s) => s.id === currentScript?.id)
    if (script) {
      Object.assign(script, scriptData)
      currentScript = script
    }
  }

  currentSite = site
  await saveSettings(settings)
}

async function deleteScript() {
  if (!settings || !currentSite || !currentScript) return
  if (!confirm(`Delete script "${currentScript.name}"?`)) return

  const site = settings.sites.find((s) => s.id === currentSite?.id)
  if (!site) return

  site.scripts = site.scripts.filter((s) => s.id !== currentScript?.id)
  currentSite = site
  await saveSettings(settings)

  currentScript = null
  isNewScript = false
}

function cancelEdit() {
  currentScript = null
  isNewScript = false
}
</script>

<div class="flex h-screen bg-[#0f0f1a] text-gray-100 font-sans text-sm overflow-hidden">
  <aside class="w-[280px] bg-[#1a1a2e] border-r border-white/10 flex flex-col">
    {#if settings}
      <TreeView
        sites={settings.sites}
        currentSiteId={currentSite?.id ?? null}
        currentScriptId={currentScript?.id ?? null}
        onSelectSite={selectSite}
        onSelectScript={selectScript}
        onAddSite={() => showAddSiteModal = true}
        onAddScript={addScript}
        onDeleteSite={deleteSite}
      />
    {/if}
  </aside>

  <main class="flex-1 flex flex-col overflow-hidden">
    {#if currentScript || isNewScript}
      <div class="flex items-center gap-3 p-4 px-6 border-b border-white/10 bg-[#1a1a2e]">
        <span class="text-gray-500 text-[13px]">{currentSite?.domain}</span>
        <span class="text-gray-600">/</span>
        <span class="text-white font-medium">{isNewScript ? 'New Script' : currentScript?.name}</span>
      </div>
      <ScriptEditor
        script={currentScript}
        isNew={isNewScript}
        onSave={saveScript}
        onDelete={deleteScript}
        onCancel={cancelEdit}
      />
    {:else}
      <div class="flex-1 flex items-center justify-center text-gray-600">
        <div class="text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-16 h-16 mx-auto mb-4 opacity-30">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p>Select a script to edit or create a new one</p>
        </div>
      </div>
    {/if}
  </main>
</div>

{#if showAddSiteModal}
  <AddSiteModal
    onConfirm={handleAddSite}
    onCancel={() => showAddSiteModal = false}
  />
{/if}
