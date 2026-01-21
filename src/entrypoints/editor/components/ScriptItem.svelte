<script lang="ts">
import { Icon } from './'

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

function handleClick() {
  onSelect?.()
}

function handleToggle(e: MouseEvent) {
  e.stopPropagation()
  onToggle()
}

function handleDelete(e: MouseEvent) {
  e.stopPropagation()
  onDelete?.()
}
</script>

<li
  class="group p-2.5 px-3 rounded-lg bg-white/5 transition-all hover:bg-white/10 {onSelect ? 'cursor-pointer' : ''}"
  onclick={onSelect ? handleClick : undefined}
>
  <div class="flex items-center gap-2">
    <span class="flex-1 min-w-0 text-[13px] font-medium text-gray-100 truncate">{name}</span>
    {#if canDelete && onDelete}
      <button onclick={handleDelete} class="opacity-0 group-hover:opacity-100 p-1 rounded bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-red-500/20 hover:text-red-400" title="Delete">
        <Icon name="trash" size={14} />
      </button>
    {/if}
    <button onclick={handleToggle} class="p-1 rounded bg-transparent border-none cursor-pointer transition-all {enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:bg-white/10'}" title={enabled ? 'Disable' : 'Enable'}>
      <Icon name={enabled ? 'eye' : 'eye-off'} size={14} />
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
