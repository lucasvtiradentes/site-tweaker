<script lang="ts">
import type { Script } from '../../../lib/configs'

interface Props {
  scripts: Script[]
  currentScriptId: string | null
  onSelect: (scriptId: string) => void
}

const { scripts, currentScriptId, onSelect }: Props = $props()
</script>

{#if scripts.length === 0}
  <p class="text-gray-600 text-center py-5 text-[13px]">No scripts for this site</p>
{:else}
  <ul class="list-none px-6 py-2 max-h-[200px] overflow-y-auto">
    {#each scripts as script (script.id)}
      <li
        role="button"
        tabindex="0"
        onclick={() => onSelect(script.id)}
        onkeydown={(e) => e.key === 'Enter' && onSelect(script.id)}
        class="flex items-center justify-between p-2.5 px-3 rounded-md cursor-pointer text-gray-400 transition-all mb-1 bg-white/[0.03] {currentScriptId === script.id ? 'bg-green-400/15 text-green-400' : 'hover:bg-white/[0.08]'}"
      >
        <span class="text-[13px] font-medium">{script.name}</span>
        <div class="flex gap-2 items-center">
          <span class="text-[10px] px-1.5 py-0.5 rounded {script.type === 'js' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-purple-500/20 text-purple-400'}">
            {script.type.toUpperCase()}
          </span>
          {#if script.autoRun}
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">AUTO</span>
          {/if}
          {#if !script.enabled}
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">OFF</span>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
{/if}
