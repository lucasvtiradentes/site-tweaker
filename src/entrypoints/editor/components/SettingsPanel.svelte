<script lang="ts">
import type { HeaderKey, Headers, Settings } from '../../../lib/configs'
import { saveSettings } from '../../../lib/storage'

interface Props {
  settings: Settings
  onUpdate: () => void
}

const { settings, onUpdate }: Props = $props()

const headerLabels: Record<HeaderKey, string> = {
  'content-security-policy': 'Content-Security-Policy',
  'content-security-policy-report-only': 'Content-Security-Policy-Report-Only',
  'x-webkit-csp': 'X-WebKit-CSP',
  'x-content-security-policy': 'X-Content-Security-Policy',
  'x-content-security-policy-report-only': 'X-Content-Security-Policy-Report-Only',
  'x-webkit-csp-report-only': 'X-WebKit-CSP-Report-Only',
  'report-to': 'Report-To',
  'reporting-endpoints': 'Reporting-Endpoints',
}

async function toggleEnabled() {
  settings.enabled = !settings.enabled
  await saveSettings(settings)
  onUpdate()
}

async function toggleFloatingUi() {
  settings.floatingUiEnabled = !settings.floatingUiEnabled
  await saveSettings(settings)
  onUpdate()
}

async function toggleAutoInject() {
  settings.autoInjectEnabled = !settings.autoInjectEnabled
  await saveSettings(settings)
  onUpdate()
}

async function toggleHeader(header: HeaderKey) {
  settings.headers[header] = !settings.headers[header]
  await saveSettings(settings)
  onUpdate()
}
</script>

<div class="flex-1 overflow-y-auto p-6">
  <div class="max-w-[600px]">
    <h2 class="text-lg font-semibold mb-6">Settings</h2>

    <section class="mb-8">
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">Extension</h3>
      <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
        <div>
          <div class="text-[13px] font-medium">Enable Extension</div>
          <div class="text-[11px] text-gray-500">Master switch for all extension features</div>
        </div>
        <button
          onclick={toggleEnabled}
          aria-label="Toggle extension"
          class="relative w-11 h-6 rounded-full transition-all cursor-pointer {settings.enabled ? 'bg-green-500' : 'bg-gray-600'}"
        >
          <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all {settings.enabled ? 'left-6' : 'left-1'}"></div>
        </button>
      </div>
    </section>

    <section class="mb-8">
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">Features</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div>
            <div class="text-[13px] font-medium">Floating UI</div>
            <div class="text-[11px] text-gray-500">Show floating button to run manual scripts</div>
          </div>
          <button
            onclick={toggleFloatingUi}
            aria-label="Toggle floating UI"
            class="relative w-11 h-6 rounded-full transition-all cursor-pointer {settings.floatingUiEnabled ? 'bg-green-500' : 'bg-gray-600'}"
          >
            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all {settings.floatingUiEnabled ? 'left-6' : 'left-1'}"></div>
          </button>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div>
            <div class="text-[13px] font-medium">Auto-inject Scripts</div>
            <div class="text-[11px] text-gray-500">Automatically run scripts marked as auto-run</div>
          </div>
          <button
            onclick={toggleAutoInject}
            aria-label="Toggle auto-inject"
            class="relative w-11 h-6 rounded-full transition-all cursor-pointer {settings.autoInjectEnabled ? 'bg-green-500' : 'bg-gray-600'}"
          >
            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all {settings.autoInjectEnabled ? 'left-6' : 'left-1'}"></div>
          </button>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">CSP Bypass Headers</h3>
      <p class="text-[11px] text-gray-500 mb-4">Select which headers to remove when CSP bypass is enabled for a site</p>
      <div class="space-y-1">
        {#each Object.entries(headerLabels) as [key, label]}
          {@const header = key as HeaderKey}
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
            <span class="text-[12px] font-mono text-gray-400">{label}</span>
            <button
              onclick={() => toggleHeader(header)}
              aria-label="Toggle {label}"
              class="relative w-9 h-5 rounded-full transition-all cursor-pointer {settings.headers[header] ? 'bg-green-500' : 'bg-gray-600'}"
            >
              <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all {settings.headers[header] ? 'left-[18px]' : 'left-0.5'}"></div>
            </button>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
