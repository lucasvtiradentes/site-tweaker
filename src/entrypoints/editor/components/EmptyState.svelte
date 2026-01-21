<script lang="ts">
import Icon from './Icon.svelte'

type IconName = 'file' | 'github' | 'shield'

interface Props {
  icon?: IconName
  title: string
  description?: string
}

const { icon = 'file', title, description = '' }: Props = $props()
</script>

<div class="text-center py-8 text-gray-500">
  <div class="w-12 h-12 mx-auto mb-3 opacity-30">
    <Icon name={icon} size={48} />
  </div>
  <p class="text-[13px]">{title}</p>
  {#if description}
    <p class="text-[11px] text-gray-600">{description}</p>
  {/if}
</div>
