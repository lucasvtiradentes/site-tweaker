<script lang="ts">
import type { Script } from '../../../lib/configs'

interface Props {
  script: Script | null
  isNew: boolean
  onSave: (data: Partial<Script>) => void
  onDelete: () => void
  onCancel: () => void
  onToggleEnabled: () => void
}

const { script, isNew, onSave, onDelete, onCancel, onToggleEnabled }: Props = $props()

let name = $state('')
let type = $state<'js' | 'css'>('js')
let autoRun = $state(false)
let runAt = $state<'document_start' | 'document_end' | 'document_idle'>('document_idle')
let enabled = $state(true)
let urlPatterns = $state('')
let code = $state('')

$effect(() => {
  if (script) {
    name = script.name
    type = script.type
    autoRun = script.autoRun
    runAt = script.runAt
    enabled = script.enabled
    urlPatterns = script.urlPatterns.join('\n')
    code = script.code
  } else if (isNew) {
    name = ''
    type = 'js'
    autoRun = false
    runAt = 'document_idle'
    enabled = true
    urlPatterns = ''
    code = ''
  }
})

const hasChanges = $derived(() => {
  if (isNew) {
    return name.trim() !== '' || code.trim() !== '' || urlPatterns.trim() !== ''
  }
  if (!script) return false
  return (
    name !== script.name ||
    type !== script.type ||
    autoRun !== script.autoRun ||
    runAt !== script.runAt ||
    urlPatterns !== script.urlPatterns.join('\n') ||
    code !== script.code
  )
})

function handleSave() {
  onSave({
    name: name.trim() || 'Untitled Script',
    type,
    autoRun,
    runAt,
    enabled,
    urlPatterns: urlPatterns
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean),
    code,
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    code = `${code.substring(0, start)}  ${code.substring(end)}`
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + 2
    })
  }
}
</script>

<div class="flex-1 flex overflow-hidden">
  <aside class="w-[220px] p-4 border-r border-white/10 flex flex-col gap-4 overflow-y-auto bg-black/20">
    <label class="flex flex-col gap-1.5">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</span>
      <input
        type="text"
        bind:value={name}
        placeholder="Script name"
        class="px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</span>
      <select
        bind:value={type}
        class="px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
      >
        <option value="js">JavaScript</option>
        <option value="css">CSS</option>
      </select>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Mode</span>
      <select
        bind:value={autoRun}
        class="px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
      >
        <option value={false}>Manual</option>
        <option value={true}>Auto</option>
      </select>
    </label>

    {#if autoRun}
      <label class="flex flex-col gap-1.5">
        <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Run At</span>
        <select
          bind:value={runAt}
          class="px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        >
          <option value="document_idle">Idle</option>
          <option value="document_end">End</option>
          <option value="document_start">Start</option>
        </select>
      </label>
    {/if}

    <label class="flex flex-col gap-1.5">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">URL Patterns</span>
      <textarea
        bind:value={urlPatterns}
        rows="3"
        placeholder="/path/*&#10;/another/path&#10;(empty = all)"
        class="px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white text-[12px] resize-y min-h-[70px] focus:outline-none focus:border-green-400"
      ></textarea>
    </label>

    <div class="flex items-center justify-between">
      <button
        onclick={() => {
          if (isNew) {
            enabled = !enabled
          } else {
            onToggleEnabled()
          }
        }}
        class="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
      >
        <div class="relative w-9 h-5 rounded-full transition-all {enabled ? 'bg-green-500' : 'bg-gray-600'}">
          <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all {enabled ? 'left-[18px]' : 'left-0.5'}"></div>
        </div>
        <span class="text-[12px] {enabled ? 'text-green-400' : 'text-gray-500'}">{enabled ? 'On' : 'Off'}</span>
      </button>
      {#if !isNew}
        <button
          onclick={onDelete}
          class="p-1.5 rounded-md bg-transparent border-none cursor-pointer text-gray-500 transition-all hover:bg-red-500/20 hover:text-red-400"
          title="Delete script"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      {/if}
    </div>
  </aside>

  <main class="flex-1 flex flex-col overflow-hidden bg-black/10">
    <label class="flex-1 p-4 overflow-hidden flex flex-col">
      <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Code</span>
      <textarea
        bind:value={code}
        onkeydown={handleKeydown}
        placeholder="// Your code here..."
        spellcheck="false"
        class="flex-1 px-4 py-3 border border-white/10 rounded-md bg-white/5 text-white text-[13px] font-mono leading-relaxed resize-none focus:outline-none focus:border-green-400"
      ></textarea>
    </label>

    <div class="flex gap-3 p-4 pt-0 justify-center">
      <button
        onclick={onCancel}
        class="px-4 py-2 bg-white/10 border-none rounded-md text-gray-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white"
      >
        Cancel
      </button>
      <button
        onclick={handleSave}
        disabled={!hasChanges()}
        class="px-4 py-2 border-none rounded-md text-[13px] font-semibold transition-all {hasChanges() ? 'bg-green-400 text-black cursor-pointer hover:bg-green-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}"
      >
        Save
      </button>
    </div>
  </main>
</div>
