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

<div class="flex-1 overflow-y-auto p-6 bg-black/20">
  <div class="max-w-[800px]">
    <div class="flex gap-4 mb-4">
      <div class="flex-1 flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
        <input
          type="text"
          bind:value={name}
          placeholder="Script name"
          class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        />
      </div>
      <div class="w-[120px] flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
        <select
          bind:value={type}
          class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        >
          <option value="js">JavaScript</option>
          <option value="css">CSS</option>
        </select>
      </div>
    </div>

    <div class="flex gap-4 mb-4">
      <div class="w-[120px] flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Run</label>
        <select
          bind:value={autoRun}
          class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        >
          <option value={false}>Manual</option>
          <option value={true}>Auto</option>
        </select>
      </div>
      <div class="w-[120px] flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Run At</label>
        <select
          bind:value={runAt}
          class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        >
          <option value="document_idle">Idle</option>
          <option value="document_end">End</option>
          <option value="document_start">Start</option>
        </select>
      </div>
      <div class="flex-1 flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
        <select
          bind:value={enabled}
          class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
        >
          <option value={true}>Enabled</option>
          <option value={false}>Disabled</option>
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-1.5 mb-4">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">
        URL Patterns (one per line, empty = all)
      </label>
      <textarea
        bind:value={urlPatterns}
        rows="2"
        placeholder="/path/*&#10;/another/path"
        class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] resize-y min-h-[60px] focus:outline-none focus:border-green-400"
      ></textarea>
    </div>

    <div class="flex flex-col gap-1.5 flex-1">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Code</label>
      <textarea
        bind:value={code}
        onkeydown={handleKeydown}
        rows="15"
        placeholder="// Your code here..."
        spellcheck="false"
        class="px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] font-mono leading-relaxed resize-y min-h-[300px] focus:outline-none focus:border-green-400"
      ></textarea>
    </div>

    <div class="flex gap-3 mt-6">
      <button
        onclick={handleSave}
        class="px-5 py-2.5 bg-green-400 border-none rounded-md text-black text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-500"
      >
        Save Script
      </button>
      {#if !isNew}
        <button
          onclick={onDelete}
          class="px-5 py-2.5 bg-red-500/20 border-none rounded-md text-red-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-red-500/30"
        >
          Delete
        </button>
      {/if}
      <button
        onclick={onCancel}
        class="px-5 py-2.5 bg-white/10 border-none rounded-md text-gray-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
