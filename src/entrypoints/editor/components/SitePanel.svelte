<script lang="ts">
import type { Script, Site } from '../../../lib/configs'

interface Props {
  site: Site
  onSelectScript: (scriptId: string) => void
  onAddScript: () => void
  onDeleteScript: (scriptId: string) => void
  onToggleScript: (scriptId: string) => void
  onToggleCsp: () => void
  onDeleteSite: () => void
}

const { site, onSelectScript, onAddScript, onDeleteScript, onToggleScript, onToggleCsp, onDeleteSite }: Props = $props()

function handleDeleteScript(e: MouseEvent, scriptId: string) {
  e.stopPropagation()
  onDeleteScript(scriptId)
}

function handleToggleScript(e: MouseEvent, scriptId: string) {
  e.stopPropagation()
  onToggleScript(scriptId)
}
</script>

<div class="flex-1 overflow-y-auto p-6">
  <div class="max-w-[800px]">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <img
          src="https://www.google.com/s2/favicons?domain={site.domain}&sz=64"
          alt=""
          class="w-8 h-8 rounded"
        />
        <h2 class="text-lg font-semibold">{site.domain}</h2>
      </div>
      <button
        onclick={onDeleteSite}
        class="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 text-red-400 text-[12px] font-medium cursor-pointer transition-all hover:bg-red-500/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
        <button
          onclick={onToggleCsp}
          aria-label="Toggle CSP bypass"
          class="relative w-11 h-6 rounded-full transition-all cursor-pointer {site.cspEnabled ? 'bg-green-500' : 'bg-gray-600'}"
        >
          <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all {site.cspEnabled ? 'left-6' : 'left-1'}"></div>
        </button>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Scripts</h3>
        <button
          onclick={onAddScript}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-black text-[12px] font-semibold cursor-pointer transition-all hover:bg-green-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Script
        </button>
      </div>

      {#if site.scripts.length === 0}
        <div class="text-center py-8 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-12 h-12 mx-auto mb-3 opacity-30">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p class="text-[13px]">No scripts yet</p>
          <p class="text-[11px] text-gray-600">Click "Add Script" to create your first script</p>
        </div>
      {:else}
        <ul class="space-y-2">
          {#each site.scripts as script (script.id)}
            <li class="group flex items-center gap-3 p-3 rounded-lg bg-white/5 transition-all hover:bg-white/10">
              <button
                onclick={() => onSelectScript(script.id)}
                class="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left"
              >
                <span class="text-[10px] px-2 py-0.5 rounded font-medium {script.type === 'js' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-purple-500/20 text-purple-400'}">
                  {script.type.toUpperCase()}
                </span>
                <span class="flex-1 text-[13px] font-medium truncate text-gray-100">{script.name}</span>
                {#if script.autoRun}
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                {/if}
              </button>
              <button
                onclick={(e) => handleDeleteScript(e, script.id)}
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-red-500/20 hover:text-red-400"
                title="Delete script"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
              <button
                onclick={(e) => handleToggleScript(e, script.id)}
                class="p-1.5 rounded bg-transparent border-none cursor-pointer transition-all {script.enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:bg-white/10'}"
                title={script.enabled ? 'Disable script' : 'Enable script'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  {#if script.enabled}
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  {:else}
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  {/if}
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</div>
