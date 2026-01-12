<script lang="ts">
import { EmptyState, Icon } from '../../../lib/components'
import type { Source } from '../../../lib/configs'
import { getDisplayUrl } from '../../../lib/sources'
import { formatRelativeTime } from '../../../lib/utils'

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
          <Icon name="refresh" size={16} class={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
        <button
          onclick={onAddSource}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-black text-[12px] font-semibold cursor-pointer transition-all hover:bg-green-400"
        >
          <Icon name="plus" size={16} />
          Add Source
        </button>
      </div>
    </div>

    {#if sources.length === 0}
      <EmptyState
        icon="github"
        title="No sources configured"
        description="Add a GitHub repository to load scripts remotely"
      />
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
                <span>Updated: {formatRelativeTime(source.lastFetched)}</span>
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
              <Icon name="trash" size={16} />
            </button>
            <button
              onclick={(e) => handleToggleSource(e, source.id)}
              class="p-1.5 rounded bg-transparent border-none cursor-pointer transition-all {source.enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:bg-white/10'}"
              title={source.enabled ? 'Disable source' : 'Enable source'}
            >
              <Icon name={source.enabled ? 'eye' : 'eye-off'} size={16} />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
