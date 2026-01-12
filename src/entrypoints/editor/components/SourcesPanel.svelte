<script lang="ts">
import type { Source } from '../../../lib/configs'
import { getDisplayUrl } from '../../../lib/sources'

interface Props {
  sources: Source[]
  onSelectSource: (sourceId: string) => void
  onAddSource: () => void
  onDeleteSource: (sourceId: string) => void
  onToggleSource: (sourceId: string) => void
  onRefreshAll: () => void
}

const { sources, onSelectSource, onAddSource, onDeleteSource, onToggleSource, onRefreshAll }: Props = $props()

let refreshing = $state(false)

function formatLastFetched(timestamp: number | null): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

async function handleRefreshAll() {
  refreshing = true
  await onRefreshAll()
  refreshing = false
}

function handleDeleteSource(e: MouseEvent, sourceId: string) {
  e.stopPropagation()
  onDeleteSource(sourceId)
}

function handleToggleSource(e: MouseEvent, sourceId: string) {
  e.stopPropagation()
  onToggleSource(sourceId)
}
</script>

<div class="flex-1 overflow-y-auto p-6">
  <div class="max-w-[800px]">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold">Sources</h2>
      <div class="flex items-center gap-2">
        <button
          onclick={handleRefreshAll}
          disabled={refreshing || sources.length === 0}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 text-gray-300 text-[12px] font-medium cursor-pointer transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 {refreshing ? 'animate-spin' : ''}">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
        <button
          onclick={onAddSource}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-black text-[12px] font-semibold cursor-pointer transition-all hover:bg-green-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Source
        </button>
      </div>
    </div>

    {#if sources.length === 0}
      <div class="text-center py-12 text-gray-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-12 h-12 mx-auto mb-3 opacity-30">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
        <p class="text-[13px]">No sources configured</p>
        <p class="text-[11px] text-gray-600">Add a GitHub repository to load scripts remotely</p>
      </div>
    {:else}
      <ul class="space-y-3">
        {#each sources as source (source.id)}
          <li class="group flex items-start gap-3 p-4 rounded-lg bg-white/5 transition-all hover:bg-white/10">
            <button
              onclick={() => onSelectSource(source.id)}
              class="flex flex-col flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[14px] font-medium text-gray-100 truncate">
                  {source.name || 'Unnamed Source'}
                </span>
                {#if source.lastError}
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">ERROR</span>
                {/if}
              </div>
              <div class="text-[11px] text-gray-500 truncate mb-1">
                {getDisplayUrl(source.url)}
              </div>
              <div class="flex items-center gap-3 text-[10px] text-gray-600">
                <span>Updated: {formatLastFetched(source.lastFetched)}</span>
                <span>{source.scripts.length} scripts</span>
              </div>
              {#if source.lastError}
                <div class="text-[10px] text-red-400 mt-1 truncate">{source.lastError}</div>
              {/if}
            </button>
            <button
              onclick={(e) => handleDeleteSource(e, source.id)}
              class="opacity-0 group-hover:opacity-100 p-1.5 rounded bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-red-500/20 hover:text-red-400"
              title="Delete source"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button
              onclick={(e) => handleToggleSource(e, source.id)}
              class="p-1.5 rounded bg-transparent border-none cursor-pointer transition-all {source.enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:bg-white/10'}"
              title={source.enabled ? 'Disable source' : 'Enable source'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                {#if source.enabled}
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                {:else}
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                {/if}
              </svg>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
