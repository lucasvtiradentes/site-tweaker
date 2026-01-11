<script lang="ts">
import type { HeaderKey, Headers } from '../../../lib/configs'

interface Props {
  headers: Headers
  onToggle: (header: HeaderKey) => void
}

const { headers, onToggle }: Props = $props()

function createToggleIcon(enabled: boolean): string {
  if (enabled) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px]">
      <rect x="1" y="5" width="22" height="14" rx="7" fill="#4ade80"/>
      <circle cx="16" cy="12" r="4" fill="#fff"/>
    </svg>`
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px]">
    <rect x="1" y="5" width="22" height="14" rx="7" fill="#444"/>
    <circle cx="8" cy="12" r="4" fill="#888"/>
  </svg>`
}

const headerEntries = $derived(Object.entries(headers) as [HeaderKey, boolean][])
</script>

<ul class="list-none max-h-[280px] overflow-y-auto">
  {#each headerEntries as [header, enabled] (header)}
    <li class="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <span class="text-xs font-mono text-gray-400">{header}</span>
      <button
        onclick={() => onToggle(header)}
        class="bg-transparent border-none cursor-pointer p-1 rounded transition-all hover:bg-white/10 {enabled ? 'text-green-400' : 'text-gray-600'}"
      >
        {@html createToggleIcon(enabled)}
      </button>
    </li>
  {/each}
</ul>
