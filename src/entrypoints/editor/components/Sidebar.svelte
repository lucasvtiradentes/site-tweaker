<script lang="ts">
import { Icon } from '../../../lib/components'
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
      <Icon name="shield" size={24} class="text-green-400" />
      <span class="text-base font-semibold">CSP Scope</span>
    </div>
  </div>

  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="p-3 px-4 flex items-center justify-between">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Sites</span>
      <button onclick={onAddSite} class="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all" title="Add site">
        <Icon name="plus" size={16} />
      </button>
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
              <img src="https://www.google.com/s2/favicons?domain={site.domain}&sz=32" alt="" class="w-4 h-4 rounded-sm" />
              <span class="text-[13px] font-medium truncate flex-1 text-left">{site.domain}</span>
              <span class="text-[9px] px-1.5 rounded bg-blue-500/20 text-blue-400">{site.totalScripts}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="border-t border-white/10 mx-2"></div>

  <div class="p-2">
    <button
      onclick={onSelectSources}
      class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all {currentView === 'sources' || currentView === 'source' ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
    >
      <Icon name="github" size={16} />
      <span class="text-[13px] font-medium">Sources</span>
      {#if sources.length > 0}
        <span class="ml-auto text-[10px] text-gray-600">{sources.length}</span>
      {/if}
    </button>
  </div>

  <div class="p-2 pt-0">
    <button
      onclick={onSelectSettings}
      class="w-full flex items-center gap-2 p-2.5 px-3 rounded-md cursor-pointer transition-all {currentView === 'settings' ? 'bg-green-400/15 text-green-400' : 'text-gray-400 hover:bg-white/5'}"
    >
      <Icon name="settings" size={16} />
      <span class="text-[13px] font-medium">Settings</span>
    </button>
  </div>
</div>
