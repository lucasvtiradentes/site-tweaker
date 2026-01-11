<script lang="ts">
interface Props {
  onConfirm: (domain: string) => void
  onCancel: () => void
}

const { onConfirm, onCancel }: Props = $props()

let domain = $state('')
let inputElement = $state<HTMLInputElement | null>(null)

$effect(() => {
  inputElement?.focus()
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    onConfirm(domain)
  } else if (e.key === 'Escape') {
    onCancel()
  }
}
</script>

<div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
  role="dialog"
  aria-modal="true"
>
  <div class="bg-[#1a1a2e] rounded-xl p-6 min-w-[300px]">
    <h3 class="mb-4 text-base font-semibold">Add Site</h3>
    <input
      type="text"
      bind:this={inputElement}
      bind:value={domain}
      onkeydown={handleKeydown}
      placeholder="example.com"
      class="w-full px-3 py-2.5 border border-white/10 rounded-md bg-white/5 text-white text-[13px] mb-4 focus:outline-none focus:border-green-400"
    />
    <div class="flex gap-3 justify-end">
      <button
        onclick={() => onConfirm(domain)}
        class="px-5 py-2.5 bg-green-400 border-none rounded-md text-black text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-500"
      >
        Add
      </button>
      <button
        onclick={onCancel}
        class="px-5 py-2.5 bg-white/10 border-none rounded-md text-gray-400 text-[13px] font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
