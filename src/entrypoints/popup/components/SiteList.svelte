<script lang="ts">
import type { Site } from '../../../lib/configs'

interface Props {
  sites: Site[]
  onToggleCsp: (siteId: string) => void
}

const { sites, onToggleCsp }: Props = $props()
</script>

{#if sites.length === 0}
  <p class="text-center text-gray-500 py-5 text-[13px] leading-relaxed">
    No sites configured yet.<br>Click "Open Editor" to add sites.
  </p>
{:else}
  <ul class="list-none max-h-[250px] overflow-y-auto">
    {#each sites as site (site.id)}
      <li class="flex items-center justify-between p-2.5 px-3 rounded-md mb-1 bg-white/[0.03] transition-all hover:bg-white/[0.06]">
        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
          <span class="text-[13px] font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap">
            {site.domain}
          </span>
          <span class="text-[11px] text-gray-600">
            {site.scripts.length} script{site.scripts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            onclick={() => onToggleCsp(site.id)}
            class="px-2 py-1 rounded text-[10px] font-semibold cursor-pointer transition-all border-none {site.cspEnabled ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-gray-500 hover:bg-white/15'}"
          >
            CSP
          </button>
        </div>
      </li>
    {/each}
  </ul>
{/if}
