<script lang="ts">
import type { Site } from '../../../lib/configs'

interface Props {
  sites: Site[]
  currentView: 'settings' | 'site'
  currentSiteId: string | null
  onSelectSettings: () => void
  onSelectSite: (siteId: string) => void
  onAddSite: () => void
}

const { sites, currentView, currentSiteId, onSelectSettings, onSelectSite, onAddSite }: Props = $props()
</script>

<div class="flex flex-col h-full">
  <div class="p-4 border-b border-white/10">
    <div class="flex items-center gap-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-green-400">
        <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25C16.6 22.15 20 17.25 20 12V6l-8-4z"/>
        <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-base font-semibold">CSP Scope</span>
    </div>
  </div>

  <div class="p-2">
    <button
      onclick={onSelectSettings}
      class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all {currentView === 'settings' ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span class="text-[13px] font-medium">Settings</span>
    </button>
  </div>

  <div class="border-t border-white/10 mx-2"></div>

  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="p-3 px-4">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Sites</span>
    </div>

    {#if sites.length === 0}
      <div class="px-4 py-2">
        <p class="text-[12px] text-gray-600">No sites configured</p>
      </div>
    {:else}
      <ul class="flex-1 overflow-y-auto px-2">
        {#each sites as site (site.id)}
          <li>
            <button
              onclick={() => onSelectSite(site.id)}
              class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all mb-1 {currentView === 'site' && currentSiteId === site.id ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
            >
              <img
                src="https://www.google.com/s2/favicons?domain={site.domain}&sz=32"
                alt=""
                class="w-4 h-4 rounded-sm"
              />
              <span class="text-[13px] font-medium truncate flex-1 text-left">{site.domain}</span>
              <span class="text-[10px] text-gray-600">{site.scripts.length}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="p-2 border-t border-white/10">
    <button
      onclick={onAddSite}
      class="w-full flex items-center justify-center gap-2 p-2.5 rounded-md cursor-pointer transition-all bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span class="text-[13px] font-medium">Add Site</span>
    </button>
  </div>
</div>
