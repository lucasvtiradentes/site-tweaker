<script lang="ts">
interface Script {
  id: string
  name: string
  type: 'js' | 'css'
  enabled: boolean
  autoRun: boolean
}

interface SourceScript {
  id: string
  name: string
  type: 'js' | 'css'
  autoRun: boolean
  enabled: boolean
  sourceId: string
}

interface Site {
  id: string
  domain: string
  enabled: boolean
  scripts: Script[]
}

interface SiteData {
  site: Site | null
  scripts: Script[]
  sourceScripts: SourceScript[]
}

interface Props {
  siteData: SiteData
}

const { siteData }: Props = $props()

let isOpen = $state(false)
let runningScriptId = $state<string | null>(null)

const manualScripts = $derived(siteData.scripts.filter((s) => !s.autoRun && s.enabled))
const manualSourceScripts = $derived((siteData.sourceScripts || []).filter((s) => !s.autoRun && s.enabled))
const hasAnyScripts = $derived(manualScripts.length > 0 || manualSourceScripts.length > 0)

async function executeScript(scriptId: string) {
  if (!siteData.site) return
  runningScriptId = scriptId
  await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_SCRIPT', siteId: siteData.site?.id, scriptId, tabId: null }, () =>
      resolve(),
    )
  })
  setTimeout(() => {
    runningScriptId = null
  }, 300)
}

async function executeSourceScript(sourceId: string, scriptId: string) {
  runningScriptId = scriptId
  await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_SOURCE_SCRIPT', sourceId, scriptId, tabId: null }, () => resolve())
  })
  setTimeout(() => {
    runningScriptId = null
  }, 300)
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  const container = target.closest('#wc-floating-ui')
  if (!container) {
    isOpen = false
  }
}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="wc-container" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
  <div class="wc-panel" class:open={isOpen}>
    <div class="wc-panel-header">
      <span class="wc-panel-title">Scripts</span>
      <button class="wc-close-btn" onclick={() => isOpen = false} aria-label="Close panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <ul class="wc-scripts-list">
      {#if !hasAnyScripts}
        <li class="wc-empty">No manual scripts</li>
      {:else}
        {#each manualScripts as script (script.id)}
          <li class="wc-script-item">
            <button
              class="wc-script-btn"
              class:running={runningScriptId === script.id}
              onclick={() => executeScript(script.id)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="wc-play-icon">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              <span class="wc-script-name">{script.name}</span>
              <span class="wc-script-type" class:css={script.type === 'css'}>
                {script.type.toUpperCase()}
              </span>
            </button>
          </li>
        {/each}
        {#each manualSourceScripts as script (script.id)}
          <li class="wc-script-item">
            <button
              class="wc-script-btn"
              class:running={runningScriptId === script.id}
              onclick={() => executeSourceScript(script.sourceId, script.id)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="wc-play-icon">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              <span class="wc-script-name">{script.name}</span>
              <span class="wc-script-type wc-source">SRC</span>
              <span class="wc-script-type" class:css={script.type === 'css'}>
                {script.type.toUpperCase()}
              </span>
            </button>
          </li>
        {/each}
      {/if}
    </ul>
  </div>

  <button class="wc-trigger" onclick={() => isOpen = !isOpen} aria-label="Toggle scripts panel">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25C16.6 22.15 20 17.25 20 12V6l-8-4z"/>
      <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>
