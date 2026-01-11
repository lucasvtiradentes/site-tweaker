<script lang="ts">
import type { HeaderKey, Settings, Site } from '../../lib/configs'
import { getSettings, saveSettings } from '../../lib/storage'
import HeaderList from './components/HeaderList.svelte'
import SiteList from './components/SiteList.svelte'

let settings = $state<Settings | null>(null)
let view = $state<'main' | 'settings'>('main')

$effect(() => {
  loadSettings()
})

async function loadSettings() {
  settings = await getSettings()
}

async function toggleGlobal() {
  if (!settings) return
  settings.enabled = !settings.enabled
  await saveSettings(settings)
}

async function toggleSiteCsp(siteId: string) {
  if (!settings) return
  const site = settings.sites.find((s) => s.id === siteId)
  if (site) {
    site.cspEnabled = !site.cspEnabled
    await saveSettings(settings)
  }
}

async function toggleHeader(header: HeaderKey) {
  if (!settings) return
  settings.headers[header] = !settings.headers[header]
  await saveSettings(settings)
}

function openEditor() {
  chrome.runtime.openOptionsPage()
}
</script>

<div class="min-w-[300px] bg-[#1a1a2e] text-gray-100 p-3 font-sans text-sm">
  <header class="flex justify-between items-center gap-2">
    <button
      onclick={toggleGlobal}
      class="p-2 rounded-lg bg-transparent border-none cursor-pointer transition-all hover:bg-white/10 {settings?.enabled ? 'text-green-400' : 'text-gray-500'}"
      title="Toggle extension"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
        <line x1="12" y1="2" x2="12" y2="12"/>
      </svg>
    </button>
    <span class="flex-1 text-sm font-semibold text-gray-400">Website Customizer</span>
    <button
      onclick={() => view = 'settings'}
      class="p-2 rounded-lg bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-white/10 hover:text-white"
      title="CSP Headers"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </header>

  <div class="h-px bg-white/10 my-3"></div>

  {#if view === 'main'}
    <main>
      <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Configured Sites
      </div>

      {#if settings}
        <SiteList sites={settings.sites} onToggleCsp={toggleSiteCsp} />
      {/if}

      <div class="h-px bg-white/10 my-3"></div>

      <button
        onclick={openEditor}
        class="w-full flex items-center justify-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-md text-gray-400 text-[13px] cursor-pointer transition-all hover:bg-white/10 hover:border-white/20 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Open Editor
      </button>
    </main>
  {:else}
    <div>
      <h3 class="text-[13px] font-medium text-gray-500 mb-3 uppercase tracking-wider">
        CSP Headers to remove
      </h3>

      {#if settings}
        <HeaderList headers={settings.headers} onToggle={toggleHeader} />
      {/if}

      <button
        onclick={() => view = 'main'}
        class="w-full mt-3 p-2.5 bg-white/10 border-none rounded-md text-gray-400 cursor-pointer text-[13px] transition-all hover:bg-white/15 hover:text-white"
      >
        Back
      </button>
    </div>
  {/if}
</div>
