<script lang="ts">
import type { Site, Source } from '../../../lib/configs'

interface Props {
  sites: Site[]
  sources: Source[]
  currentView: 'settings' | 'site' | 'sources' | 'source'
  currentSiteId: string | null
  onSelectSettings: () => void
  onSelectSite: (siteId: string) => void
  onSelectSources: () => void
  onAddSite: () => void
}

const {
  sites,
  sources,
  currentView,
  currentSiteId,
  onSelectSettings,
  onSelectSite,
  onSelectSources,
  onAddSite,
}: Props = $props()

interface MergedSite {
  domain: string
  siteId: string | null
  manualScripts: number
  sourceScripts: number
  totalScripts: number
}

const mergedSites = $derived<MergedSite[]>(() => {
  const domainMap = new Map<string, MergedSite>()

  for (const site of sites) {
    domainMap.set(site.domain, {
      domain: site.domain,
      siteId: site.id,
      manualScripts: site.scripts.length,
      sourceScripts: 0,
      totalScripts: site.scripts.length,
    })
  }

  for (const source of sources) {
    if (!source.enabled) continue
    for (const script of source.scripts) {
      if (!script.enabled) continue
      for (const domain of script.domains) {
        const cleanDomain = domain.replace(/^\*\./, '')
        const existing = domainMap.get(cleanDomain)
        if (existing) {
          existing.sourceScripts++
          existing.totalScripts++
        } else {
          domainMap.set(cleanDomain, {
            domain: cleanDomain,
            siteId: null,
            manualScripts: 0,
            sourceScripts: 1,
            totalScripts: 1,
          })
        }
      }
    }
  }

  return Array.from(domainMap.values()).sort((a, b) => a.domain.localeCompare(b.domain))
})
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

  <div class="p-2">
    <button
      onclick={onSelectSources}
      class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all {currentView === 'sources' || currentView === 'source' ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
      <span class="text-[13px] font-medium">Sources</span>
      {#if sources.length > 0}
        <span class="ml-auto text-[10px] text-gray-600">{sources.length}</span>
      {/if}
    </button>
  </div>

  <div class="border-t border-white/10 mx-2"></div>

  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="p-3 px-4">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Sites</span>
    </div>

    {#if mergedSites().length === 0}
      <div class="px-4 py-2">
        <p class="text-[12px] text-gray-600">No sites configured</p>
      </div>
    {:else}
      <ul class="flex-1 overflow-y-auto px-2">
        {#each mergedSites() as site (site.domain)}
          <li>
            <button
              onclick={() => site.siteId && onSelectSite(site.siteId)}
              class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all mb-1 {currentView === 'site' && currentSiteId === site.siteId ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
            >
              <img
                src="https://www.google.com/s2/favicons?domain={site.domain}&sz=32"
                alt=""
                class="w-4 h-4 rounded-sm"
              />
              <span class="text-[13px] font-medium truncate flex-1 text-left">{site.domain}</span>
              {#if site.sourceScripts > 0}
                <span class="text-[9px] px-1 rounded bg-blue-500/20 text-blue-400">{site.sourceScripts}</span>
              {/if}
              <span class="text-[10px] text-gray-600">{site.totalScripts}</span>
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
