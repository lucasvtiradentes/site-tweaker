<script lang="ts">
import { EmptyState, Icon } from '../../../lib/components'
import type { Source, SourceScript } from '../../../lib/configs'
import { getDisplayUrl } from '../../../lib/sources'
import { formatDate } from '../../../lib/utils'
import ScriptList from './ScriptList.svelte'

interface Props {
  source: Source
  onBack: () => void
  onRefresh: () => void
  onSelectScript: (script: SourceScript) => void
  onToggleScript: (scriptId: string) => void
  onUpdateToken: (token: string | null) => void
}

const { source, onBack, onRefresh, onSelectScript, onToggleScript, onUpdateToken }: Props = $props()

let refreshing = $state(false)
let editingToken = $state(false)
let tokenValue = $state('')
let showToken = $state(false)

interface DomainGroup {
  domain: string
  scripts: SourceScript[]
}

const scriptsByDomain = $derived<DomainGroup[]>(() => {
  const groups = new Map<string, SourceScript[]>()
  for (const script of source.scripts) {
    const domain = script.domains[0] || 'All domains'
    if (!groups.has(domain)) {
      groups.set(domain, [])
    }
    groups.get(domain)?.push(script)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([domain, scripts]) => ({ domain, scripts }))
})

async function handleRefresh() {
  refreshing = true
  await onRefresh()
  refreshing = false
}

function startEditToken() {
  tokenValue = source.token || ''
  editingToken = true
}

async function saveToken() {
  await onUpdateToken(tokenValue.trim() || null)
  editingToken = false
}

function cancelEditToken() {
  editingToken = false
  tokenValue = ''
}
</script>

<div class="flex-1 overflow-y-auto p-6">
  <div class="max-w-[800px]">
    <div class="flex items-center gap-3 mb-6">
      <button onclick={onBack} aria-label="Go back" class="text-gray-500 hover:text-white transition-all">
        <Icon name="chevron-left" size={20} />
      </button>
      <div class="flex-1">
        <h2 class="text-lg font-semibold">{source.name || 'Unnamed Source'}</h2>
        <div class="text-[12px] text-gray-500">{getDisplayUrl(source.url)}</div>
      </div>
      <button onclick={handleRefresh} disabled={refreshing} class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 text-gray-300 text-[12px] font-medium cursor-pointer transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
        <Icon name="refresh" size={16} class={refreshing ? 'animate-spin' : ''} />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>

    <section class="mb-6">
      <div class="flex items-center gap-4 p-4 rounded-lg bg-white/5 text-[12px]">
        <div><span class="text-gray-500">Version:</span><span class="text-gray-300 ml-1">{source.version || 'N/A'}</span></div>
        <div><span class="text-gray-500">Updated:</span><span class="text-gray-300 ml-1">{formatDate(source.lastFetched)}</span></div>
        <div><span class="text-gray-500">Auth:</span><span class="ml-1 {source.token ? 'text-green-400' : 'text-gray-500'}">{source.token ? 'Token set' : 'Public'}</span></div>
        {#if source.lastError}<div class="text-red-400">Error: {source.lastError}</div>{/if}
      </div>
      {#if source.description}<p class="text-[12px] text-gray-500 mt-3">{source.description}</p>{/if}
    </section>

    <section class="mb-6">
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">Authentication</h3>
      <div class="p-4 rounded-lg bg-white/5">
        {#if editingToken}
          <div class="flex items-center gap-2 mb-2">
            <input type={showToken ? 'text' : 'password'} bind:value={tokenValue} placeholder="ghp_xxxx... (leave empty to remove)" class="flex-1 px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[12px] focus:outline-none focus:border-green-400 font-mono" />
            <button onclick={() => showToken = !showToken} class="p-2 text-gray-500 hover:text-gray-300">
              <Icon name={showToken ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
          <div class="flex gap-2">
            <button onclick={saveToken} class="px-3 py-1.5 bg-green-500 text-black text-[11px] font-semibold rounded-md hover:bg-green-400">Save</button>
            <button onclick={cancelEditToken} class="px-3 py-1.5 bg-white/10 text-gray-400 text-[11px] font-medium rounded-md hover:bg-white/15">Cancel</button>
          </div>
        {:else}
          <div class="flex items-center justify-between">
            <div class="text-[12px]">
              {#if source.token}<span class="text-green-400">Token configured</span><span class="text-gray-600 ml-2">(ghp_...{source.token.slice(-4)})</span>{:else}<span class="text-gray-500">No token (public repo only)</span>{/if}
            </div>
            <button onclick={startEditToken} class="text-[11px] text-gray-400 hover:text-white">{source.token ? 'Change' : 'Add token'}</button>
          </div>
        {/if}
      </div>
    </section>

    <section>
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">Scripts ({source.scripts.length})</h3>

      {#if source.scripts.length === 0}
        <EmptyState
          icon="file"
          title="No scripts in this source"
          description="Check the repository's csp-scope.config.json"
        />
      {:else}
        <div class="space-y-5">
          {#each scriptsByDomain() as group (group.domain)}
            <div>
              <div class="flex items-center gap-2 mb-3">
                <img src="https://www.google.com/s2/favicons?domain={group.domain}&sz=32" alt="" class="w-4 h-4 rounded-sm" />
                <span class="text-[13px] font-medium text-gray-300">{group.domain}</span>
                <span class="text-[10px] text-gray-600">({group.scripts.length})</span>
              </div>
              <div class="pl-6">
                <ScriptList
                  sourceScripts={group.scripts}
                  onSelectSourceScript={onSelectScript}
                  onToggleSourceScript={(sourceId, scriptId) => onToggleScript(scriptId)}
                />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
