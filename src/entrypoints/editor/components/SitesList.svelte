<script lang="ts">
import type { Site } from '@/lib/configs'

interface Props {
  sites: Site[]
  currentSiteId: string | null
  onSelect: (siteId: string) => void
}

const { sites, currentSiteId, onSelect }: Props = $props()
</script>

{#if sites.length === 0}
  <p class="text-gray-600 text-center py-5 text-[13px]">No sites yet</p>
{:else}
  <ul class="list-none flex-1 overflow-y-auto p-2">
    {#each sites as site (site.id)}
      <li
        role="button"
        tabindex="0"
        onclick={() => onSelect(site.id)}
        onkeydown={(e) => e.key === 'Enter' && onSelect(site.id)}
        class="p-2.5 px-3 rounded-md cursor-pointer text-gray-400 transition-all mb-1 {currentSiteId === site.id ? 'bg-green-400/15 text-green-400' : 'hover:bg-white/5'}"
      >
        <div class="text-[13px] font-medium">{site.domain}</div>
        <div class="text-[11px] text-gray-600 mt-0.5">
          {site.scripts.length} script{site.scripts.length !== 1 ? 's' : ''}
        </div>
      </li>
    {/each}
  </ul>
{/if}
