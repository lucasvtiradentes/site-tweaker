<script lang="ts">
import Toggle from './Toggle.svelte'

interface Props {
  title: string
  description?: string
  checked: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}

const { title, description = '', checked, onToggle, size = 'md' }: Props = $props()
</script>

<div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
  <div>
    <div class="text-[13px] font-medium">{title}</div>
    {#if description}
      <div class="text-[11px] text-gray-500">{description}</div>
    {/if}
  </div>
  <Toggle {checked} {onToggle} label="Toggle {title}" {size} />
</div>
