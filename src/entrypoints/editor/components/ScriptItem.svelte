<script lang="ts">
interface Props {
  name: string
  enabled: boolean
  autoRun?: boolean
  isSource?: boolean
  paths?: string[]
  canDelete?: boolean
  onSelect?: () => void
  onToggle: () => void
  onDelete?: () => void
}

const {
  name,
  enabled,
  autoRun = false,
  isSource = false,
  paths = [],
  canDelete = false,
  onSelect,
  onToggle,
  onDelete,
}: Props = $props()

function handleToggle(e: MouseEvent) {
  e.stopPropagation()
  onToggle()
}

function handleDelete(e: MouseEvent) {
  e.stopPropagation()
  onDelete?.()
}
</script>

<li class="group p-2.5 px-3 rounded-lg bg-white/5 transition-all hover:bg-white/10">
  <div class="flex items-center gap-2">
    {#if onSelect}
      <button onclick={onSelect} class="flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left text-[13px] font-medium text-gray-100 truncate">
        {name}
      </button>
    {:else}
      <span class="flex-1 min-w-0 text-[13px] font-medium text-gray-100 truncate">{name}</span>
    {/if}
    {#if canDelete && onDelete}
      <button onclick={handleDelete} class="opacity-0 group-hover:opacity-100 p-1 rounded bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-red-500/20 hover:text-red-400" title="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    {/if}
    <button onclick={handleToggle} class="p-1 rounded bg-transparent border-none cursor-pointer transition-all {enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:bg-white/10'}" title={enabled ? 'Disable' : 'Enable'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
        {#if enabled}
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        {:else}
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
        {/if}
      </svg>
    </button>
  </div>
  {#if isSource || autoRun || paths.length > 0}
    <div class="flex gap-1 mt-1">
      {#if isSource}<span class="text-[8px] px-1 py-px rounded bg-cyan-500/15 text-cyan-400/80 font-medium">source</span>{/if}
      {#if autoRun}<span class="text-[8px] px-1 py-px rounded bg-blue-500/15 text-blue-400/80 font-medium">auto</span>{/if}
      {#if paths.length > 0}<span class="text-[8px] text-gray-500">{paths.join(', ')}</span>{/if}
    </div>
  {/if}
</li>
