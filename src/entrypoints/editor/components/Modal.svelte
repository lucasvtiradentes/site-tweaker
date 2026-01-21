<script lang="ts">
import type { Snippet } from 'svelte'

interface Props {
  title: string
  children: Snippet
  actions: Snippet
  width?: string
}

const { title, children, actions, width = 'min-w-[300px]' }: Props = $props()
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" role="dialog" aria-modal="true">
  <div class="bg-[#1a1a2e] rounded-xl p-6 {width}">
    <h3 class="mb-4 text-base font-semibold">{title}</h3>
    {@render children()}
    <div class="flex gap-3 justify-end mt-4">
      {@render actions()}
    </div>
  </div>
</div>
