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

const isEmpty = $derived(scripts.length === 0 && sourceScripts.length === 0)
</script>

{#if isEmpty}
  <EmptyState icon="file" title="No scripts" />
{:else}
  <ul class="space-y-1">
    {#each scripts as script (script.id)}
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
    {#each sourceScripts as script (script.id)}
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
