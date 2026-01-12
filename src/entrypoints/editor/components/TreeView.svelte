<script lang="ts">
import type { Script, Site } from '../../../lib/configs'

interface Props {
  sites: Site[]
  currentSiteId: string | null
  currentScriptId: string | null
  onSelectSite: (siteId: string) => void
  onSelectScript: (siteId: string, scriptId: string) => void
  onAddSite: () => void
  onAddScript: (siteId: string) => void
  onDeleteSite: (siteId: string) => void
}

const {
  sites,
  currentSiteId,
  currentScriptId,
  onSelectSite,
  onSelectScript,
  onAddSite,
  onAddScript,
  onDeleteSite,
}: Props = $props()

let expandedSites = $state<Set<string>>(new Set())

$effect(() => {
  if (currentSiteId && !expandedSites.has(currentSiteId)) {
    expandedSites = new Set([...expandedSites, currentSiteId])
  }
})

function toggleSite(siteId: string) {
  const newSet = new Set(expandedSites)
  if (newSet.has(siteId)) {
    newSet.delete(siteId)
  } else {
    newSet.add(siteId)
  }
  expandedSites = newSet
  onSelectSite(siteId)
}

function handleScriptClick(e: MouseEvent, siteId: string, scriptId: string) {
  e.stopPropagation()
  onSelectScript(siteId, scriptId)
}

function handleAddScript(e: MouseEvent, siteId: string) {
  e.stopPropagation()
  onAddScript(siteId)
}

function handleDeleteSite(e: MouseEvent, siteId: string) {
  e.stopPropagation()
  onDeleteSite(siteId)
}
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center justify-between p-4 border-b border-white/10">
    <h1 class="text-base font-semibold">Sites</h1>
    <button
      onclick={onAddSite}
      class="bg-transparent border-none cursor-pointer p-1.5 rounded-md text-gray-500 transition-all hover:bg-white/10 hover:text-white"
      title="Add site"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>

  {#if sites.length === 0}
    <p class="text-gray-600 text-center py-5 text-[13px]">No sites yet</p>
  {:else}
    <ul class="list-none flex-1 overflow-y-auto p-2">
      {#each sites as site (site.id)}
        {@const isExpanded = expandedSites.has(site.id)}
        {@const isSelected = currentSiteId === site.id}
        <li class="mb-1">
          <div
            role="button"
            tabindex="0"
            onclick={() => toggleSite(site.id)}
            onkeydown={(e) => e.key === 'Enter' && toggleSite(site.id)}
            class="group flex items-center gap-2 p-2 px-2.5 rounded-md cursor-pointer transition-all {isSelected ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-4 h-4 transition-transform {isExpanded ? 'rotate-90' : ''}"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span class="flex-1 text-[13px] font-medium truncate">
              {site.domain} <span class="text-gray-500">({site.scripts.length})</span>
            </span>
            <button
              onclick={(e) => handleAddScript(e, site.id)}
              class="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer p-1 rounded text-gray-500 transition-all hover:bg-white/10 hover:text-green-400"
              title="Add script"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button
              onclick={(e) => handleDeleteSite(e, site.id)}
              class="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer p-1 rounded text-gray-500 transition-all hover:bg-white/10 hover:text-red-400"
              title="Delete site"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>

          {#if isExpanded}
            <ul class="list-none ml-4 mt-1 border-l border-white/10">
              {#each site.scripts as script (script.id)}
                {@const isScriptSelected = currentScriptId === script.id}
                <li
                  role="button"
                  tabindex="0"
                  onclick={(e) => handleScriptClick(e, site.id, script.id)}
                  onkeydown={(e) => e.key === 'Enter' && onSelectScript(site.id, script.id)}
                  class="flex items-center gap-2 p-2 pl-4 ml-px rounded-r-md cursor-pointer transition-all {isScriptSelected ? 'bg-green-400/15 text-green-400' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}"
                >
                  <span class="text-[12px] truncate flex-1">{script.name}</span>
                  <span class="text-[9px] px-1.5 py-0.5 rounded {script.type === 'js' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-purple-500/20 text-purple-400'}">
                    {script.type.toUpperCase()}
                  </span>
                  {#if !script.enabled}
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">OFF</span>
                  {/if}
                </li>
              {/each}
              {#if site.scripts.length === 0}
                <li class="text-[11px] text-gray-600 p-2 pl-4">No scripts</li>
              {/if}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
