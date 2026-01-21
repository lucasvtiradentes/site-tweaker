<script lang="ts">
import type { Script, SourceScript } from '../../../lib/configs'
import { EmptyState } from './'
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
  <EmptyState icon="file" title="No scripts" />
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
