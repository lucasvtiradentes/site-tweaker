<script lang="ts">
import type { Script } from '../../../lib/configs'

interface Props {
  script: Script | null
  isNew: boolean
  onSave: (data: Partial<Script>) => void
  onDelete: () => void
  onCancel: () => void
}

const { script, isNew, onSave, onDelete, onCancel }: Props = $props()

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

    <button
      onclick={() => enabled = !enabled}
      class="flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer {enabled ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}"
    >
      <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {enabled ? 'border-green-400' : 'border-red-400'}">
        {#if enabled}
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
        {/if}
      </div>
      <span class="text-[13px]">{enabled ? 'Enabled' : 'Disabled'}</span>
    </button>
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

    <div class="flex gap-3 p-4 pt-0 justify-end">
      <button
        onclick={onCancel}
        class="px-4 py-2 bg-white/10 border-none rounded-md text-gray-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white"
      >
        Cancel
      </button>
      {#if !isNew}
        <button
          onclick={onDelete}
          class="px-4 py-2 bg-red-500/20 border-none rounded-md text-red-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-red-500/30"
        >
          Delete
        </button>
      {/if}
      <button
        onclick={handleSave}
        class="px-4 py-2 bg-green-400 border-none rounded-md text-black text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-500"
      >
        Save
      </button>
    </div>
  </main>
</div>
