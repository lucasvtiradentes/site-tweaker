<script lang="ts">
import type { HeaderKey, Settings } from '../../../lib/configs'
import { saveSettings } from '../../../lib/storage'
import { SettingRow, Toggle } from './'

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
      <SettingRow
        title="Enable Extension"
        description="Master switch for all extension features"
        checked={settings.enabled}
        onToggle={toggleEnabled}
      />
    </section>

    <section class="mb-8">
      <h3 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">Features</h3>
      <div class="space-y-2">
        <SettingRow
          title="Floating UI"
          description="Show floating button to run manual scripts"
          checked={settings.floatingUiEnabled}
          onToggle={toggleFloatingUi}
        />
        <SettingRow
          title="Auto-inject Scripts"
          description="Automatically run scripts marked as auto-run"
          checked={settings.autoInjectEnabled}
          onToggle={toggleAutoInject}
        />
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
            <Toggle checked={settings.headers[header]} onToggle={() => toggleHeader(header)} label="Toggle {label}" size="sm" />
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
