<script lang="ts">
import type { Script, SourceScript } from '../../../lib/configs'
import ScriptItem from './ScriptItem.svelte'

interface Props {
  scripts?: Script[]
  sourceScripts?: SourceScript[]
  onSelectScript?: (scriptId: string) => void
  onDeleteScript?: (scriptId: string) => void
  onToggleScript?: (scriptId: string) => void
  onSelectSourceScript?: (script: SourceScript) => void
  onToggleSourceScript?: (sourceId: string, scriptId: string) => void
}

const {
  scripts = [],
  sourceScripts = [],
  onSelectScript,
  onDeleteScript,
  onToggleScript,
  onSelectSourceScript,
  onToggleSourceScript,
}: Props = $props()

const jsScripts = $derived(scripts.filter((s) => s.type === 'js'))
const cssScripts = $derived(scripts.filter((s) => s.type === 'css'))
const jsSourceScripts = $derived(sourceScripts.filter((s) => s.type === 'js'))
const cssSourceScripts = $derived(sourceScripts.filter((s) => s.type === 'css'))
const hasScripts = $derived(jsScripts.length > 0 || jsSourceScripts.length > 0)
const hasStyles = $derived(cssScripts.length > 0 || cssSourceScripts.length > 0)
const isEmpty = $derived(!hasScripts && !hasStyles)
</script>

{#if isEmpty}
  <div class="text-center py-8 text-gray-500">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-12 h-12 mx-auto mb-3 opacity-30">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
    <p class="text-[13px]">No scripts</p>
  </div>
{:else}
  <div class="space-y-4">
    <section>
      <h4 class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Scripts</h4>
      {#if !hasScripts}
        <p class="text-[11px] text-gray-600 py-1">None</p>
      {:else}
        <ul class="space-y-1">
          {#each jsScripts as script (script.id)}
            <ScriptItem
              name={script.name}
              enabled={script.enabled}
              autoRun={script.autoRun}
              canDelete={!!onDeleteScript}
              onSelect={onSelectScript ? () => onSelectScript(script.id) : undefined}
              onToggle={() => onToggleScript?.(script.id)}
              onDelete={() => onDeleteScript?.(script.id)}
            />
          {/each}
          {#each jsSourceScripts as script (script.id)}
            <ScriptItem
              name={script.name}
              enabled={script.enabled}
              autoRun={script.autoRun}
              isSource
              paths={script.paths}
              onSelect={onSelectSourceScript ? () => onSelectSourceScript(script) : undefined}
              onToggle={() => onToggleSourceScript?.(script.sourceId, script.id)}
            />
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h4 class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Styles</h4>
      {#if !hasStyles}
        <p class="text-[11px] text-gray-600 py-1">None</p>
      {:else}
        <ul class="space-y-1">
          {#each cssScripts as script (script.id)}
            <ScriptItem
              name={script.name}
              enabled={script.enabled}
              autoRun={script.autoRun}
              canDelete={!!onDeleteScript}
              onSelect={onSelectScript ? () => onSelectScript(script.id) : undefined}
              onToggle={() => onToggleScript?.(script.id)}
              onDelete={() => onDeleteScript?.(script.id)}
            />
          {/each}
          {#each cssSourceScripts as script (script.id)}
            <ScriptItem
              name={script.name}
              enabled={script.enabled}
              autoRun={script.autoRun}
              isSource
              paths={script.paths}
              onSelect={onSelectSourceScript ? () => onSelectSourceScript(script) : undefined}
              onToggle={() => onToggleSourceScript?.(script.sourceId, script.id)}
            />
          {/each}
        </ul>
      {/if}
    </section>
  </div>
{/if}
