<script lang="ts">
import { parseGitHubUrl } from '../../../lib/sources'

interface Props {
  onConfirm: (url: string, token: string | null) => void
  onCancel: () => void
}

const { onConfirm, onCancel }: Props = $props()

let url = $state('')
let token = $state('')
let inputElement = $state<HTMLInputElement | null>(null)
let loading = $state(false)
let error = $state('')
let showToken = $state(false)

const isValid = $derived(() => {
  if (!url.trim()) return false
  return parseGitHubUrl(url.trim()) !== null
})

$effect(() => {
  inputElement?.focus()
})

async function handleConfirm() {
  if (!isValid()) return
  error = ''
  loading = true
  try {
    await onConfirm(url.trim(), token.trim() || null)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to add source'
    loading = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && isValid()) {
    handleConfirm()
  } else if (e.key === 'Escape') {
    onCancel()
  }
}

function handleInput() {
  error = ''
}
</script>

<div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
  role="dialog"
  aria-modal="true"
>
  <div class="bg-[#1a1a2e] rounded-xl p-6 min-w-[450px]">
    <h3 class="mb-2 text-base font-semibold">Add Source</h3>
    <p class="text-[12px] text-gray-500 mb-4">
      Enter a GitHub repository URL. The repo must contain a <code class="text-green-400">csp-scope.config.json</code> file.
    </p>

    <div class="mb-3">
      <label class="block text-[11px] text-gray-400 mb-1">Repository URL</label>
      <input
        type="text"
        bind:this={inputElement}
        bind:value={url}
        oninput={handleInput}
        onkeydown={handleKeydown}
        placeholder="https://github.com/username/repo"
        class="w-full px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400"
      />
    </div>

    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <label class="text-[11px] text-gray-400">GitHub Token (for private repos)</label>
        <button
          type="button"
          onclick={() => showToken = !showToken}
          class="text-[10px] text-gray-500 hover:text-gray-300"
        >
          {showToken ? 'Hide' : 'Show'}
        </button>
      </div>
      <input
        type={showToken ? 'text' : 'password'}
        bind:value={token}
        oninput={handleInput}
        onkeydown={handleKeydown}
        placeholder="ghp_xxxx... (optional)"
        class="w-full px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] focus:outline-none focus:border-green-400 font-mono"
      />
      <p class="text-[10px] text-gray-600 mt-1">
        Required for private repos. Needs <code class="text-gray-500">repo</code> scope.
      </p>
    </div>

    {#if error}
      <p class="text-[11px] text-red-400 mb-3">{error}</p>
    {:else if url && !isValid()}
      <p class="text-[11px] text-yellow-400 mb-3">Enter a valid GitHub URL</p>
    {:else}
      <p class="h-[18px] mb-3"></p>
    {/if}

    <div class="flex gap-3 justify-end">
      <button
        onclick={handleConfirm}
        disabled={!isValid() || loading}
        class="px-5 py-2.5 bg-green-400 border-none rounded-md text-black text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add'}
      </button>
      <button
        onclick={onCancel}
        disabled={loading}
        class="px-5 py-2.5 bg-white/10 border-none rounded-md text-gray-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
