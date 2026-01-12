<script lang="ts">
import type { Site, SourceScript } from '../../../lib/configs'
import ScriptList from './ScriptList.svelte'

interface Props {
  site: Site
  sourceScripts: SourceScript[]
  onSelectScript: (scriptId: string) => void
  onSelectSourceScript: (script: SourceScript) => void
  onAddScript: () => void
  onDeleteScript: (scriptId: string) => void
  onToggleScript: (scriptId: string) => void
  onToggleSourceScript: (sourceId: string, scriptId: string) => void
  onToggleCsp: () => void
  onDeleteSite: () => void
}

const {
  site,
  sourceScripts,
  onSelectScript,
  onSelectSourceScript,
  onAddScript,
  onDeleteScript,
  onToggleScript,
  onToggleSourceScript,
  onToggleCsp,
  onDeleteSite,
}: Props = $props()
</script>

<div class="flex-1 overflow-y-auto p-6">
  <div class="max-w-[800px]">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <img src="https://www.google.com/s2/favicons?domain={site.domain}&sz=64" alt="" class="w-8 h-8 rounded" />
        <h2 class="text-lg font-semibold">{site.domain}</h2>
      </div>
      <button onclick={onDeleteSite} class="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 text-red-400 text-[12px] font-medium cursor-pointer transition-all hover:bg-red-500/20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Delete Site
      </button>
    </div>

    <section class="mb-8">
      <div class="flex items-center justify-between p-4 rounded-lg bg-white/5">
        <div>
          <div class="text-[13px] font-medium">CSP Bypass</div>
          <div class="text-[11px] text-gray-500">Remove CSP headers for this site (uses global config)</div>
        </div>
        <button onclick={onToggleCsp} aria-label="Toggle CSP bypass" class="relative w-11 h-6 rounded-full transition-all cursor-pointer {site.cspEnabled ? 'bg-green-500' : 'bg-gray-600'}">
          <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all {site.cspEnabled ? 'left-6' : 'left-1'}"></div>
        </button>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Scripts & Styles</h3>
        <button onclick={onAddScript} class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-black text-[12px] font-semibold cursor-pointer transition-all hover:bg-green-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add
        </button>
      </div>
      <ScriptList
        scripts={site.scripts}
        {sourceScripts}
        {onSelectScript}
        {onDeleteScript}
        {onToggleScript}
        {onSelectSourceScript}
        {onToggleSourceScript}
      />
    </section>
  </div>
</div>
