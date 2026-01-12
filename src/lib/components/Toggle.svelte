<script lang="ts">
interface Props {
  checked: boolean
  onToggle: () => void
  label?: string
  size?: 'sm' | 'md'
}

const { checked, onToggle, label = '', size = 'md' }: Props = $props()

const sizeClasses = $derived(
  size === 'sm'
    ? { track: 'w-9 h-5', thumb: 'w-4 h-4 top-0.5', onPos: 'left-[18px]', offPos: 'left-0.5' }
    : { track: 'w-11 h-6', thumb: 'w-4 h-4 top-1', onPos: 'left-6', offPos: 'left-1' },
)
</script>

<button
  onclick={onToggle}
  aria-label={label}
  class="relative rounded-full transition-all cursor-pointer {sizeClasses.track} {checked ? 'bg-green-500' : 'bg-gray-600'}"
>
  <div
    class="absolute rounded-full bg-white transition-all {sizeClasses.thumb} {checked ? sizeClasses.onPos : sizeClasses.offPos}"
  ></div>
</button>
