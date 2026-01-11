<script lang="ts">
import { type Script, type Settings, type Site, createScript, createSite } from '../../lib/configs'
import { getSettings, saveSettings } from '../../lib/storage'
import AddSiteModal from './components/AddSiteModal.svelte'
import ScriptEditor from './components/ScriptEditor.svelte'
import ScriptsList from './components/ScriptsList.svelte'
import SitesList from './components/SitesList.svelte'

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

function selectScript(scriptId: string) {
  if (!currentSite) return
  currentScript = currentSite.scripts.find((s) => s.id === scriptId) ?? null
  isNewScript = false
}

function addScript() {
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

async function deleteSite() {
  if (!settings || !currentSite) return
  if (!confirm(`Delete site "${currentSite.domain}" and all its scripts?`)) return

  settings.sites = settings.sites.filter((s) => s.id !== currentSite?.id)
  await saveSettings(settings)
  currentSite = null
  currentScript = null
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
  <aside class="w-[250px] bg-[#1a1a2e] border-r border-white/10 flex flex-col">
    <div class="flex items-center justify-between p-4 border-b border-white/10">
      <h1 class="text-base font-semibold">Sites</h1>
      <button
        onclick={() => showAddSiteModal = true}
        class="bg-transparent border-none cursor-pointer p-1.5 rounded-md text-gray-500 transition-all hover:bg-white/10 hover:text-white"
        title="Add site"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
    {#if settings}
      <SitesList
        sites={settings.sites}
        currentSiteId={currentSite?.id ?? null}
        onSelect={selectSite}
      />
    {/if}
  </aside>

  <main class="flex-1 flex flex-col overflow-hidden">
    {#if !currentSite}
      <div class="flex-1 flex items-center justify-center text-gray-600">
        <p>Select a site from the sidebar or add a new one</p>
      </div>
    {:else}
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-[#1a1a2e]">
          <h2 class="text-lg font-semibold">{currentSite.domain}</h2>
          <div class="flex gap-2">
            <button
              onclick={deleteSite}
              class="px-5 py-2.5 bg-red-500/20 border-none rounded-md text-red-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-red-500/30"
            >
              Delete Site
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 px-6 border-b border-white/10">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Scripts</h3>
          <button
            onclick={addScript}
            class="px-5 py-2.5 bg-green-400 border-none rounded-md text-black text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-500"
          >
            + Add Script
          </button>
        </div>

        <ScriptsList
          scripts={currentSite.scripts}
          currentScriptId={currentScript?.id ?? null}
          onSelect={selectScript}
        />

        {#if currentScript || isNewScript}
          <ScriptEditor
            script={currentScript}
            isNew={isNewScript}
            onSave={saveScript}
            onDelete={deleteScript}
            onCancel={cancelEdit}
          />
        {/if}
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
