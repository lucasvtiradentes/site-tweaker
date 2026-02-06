# 2. Editor (Options Page)

Full-featured UI for managing sites, scripts, sources, and settings. Built with Svelte 5 + Tailwind CSS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EDITOR PAGE                                 │
│                (src/entrypoints/editor/)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ENTRY:                                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  main.ts → mounts App.svelte with Tailwind CSS                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  LAYOUT (App.svelte):                                               │
│  ┌────────────┬──────────────────────────────────────────────────┐  │
│  │            │                                                  │  │
│  │  Sidebar   │             Main Content Area                    │  │
│  │            │                                                  │  │
│  │  ┌──────┐  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Nav  │  │  │  SettingsPanel  │ SitePanel │ SourcesPanel │  │  │
│  │  │      │  │  │  SourceDetails  │ ScriptEditor             │  │  │
│  │  │Sites │  │  └────────────────────────────────────────────┘  │  │
│  │  │list  │  │                                                  │  │
│  │  │      │  │  ┌────────────────────────────────────────────┐  │  │
│  │  │Source│  │  │  Modals: AddSiteModal, AddSourceModal      │  │  │
│  │  │list  │  │  └────────────────────────────────────────────┘  │  │
│  │  └──────┘  │                                                  │  │
│  └────────────┴──────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Views

| View            | Component           | Purpose                              |
|-----------------|---------------------|--------------------------------------|
| `settings`      | SettingsPanel       | Global toggles, CSP header config    |
| `site`          | SitePanel           | Site domain, script list, CSP toggle |
| `sources`       | SourcesPanel        | GitHub sources list with controls    |
| `source`        | SourceDetails       | Single source info + scripts         |
| (script editor) | ScriptEditor        | Code editor + script metadata form   |

## State Management (App.svelte)

Svelte 5 runes for reactive state:

| State Variable          | Type       | Purpose                          |
|-------------------------|------------|----------------------------------|
| `settings`              | `$state`   | Full extension configuration     |
| `currentView`           | `$state`   | Active panel name                |
| `currentSiteId`         | `$state`   | Selected site ID                 |
| `currentSourceId`       | `$state`   | Selected source ID               |
| `currentScriptId`       | `$state`   | Selected script ID               |
| `viewingSourceScript`   | `$state`   | Source script being viewed       |
| `isNewScript`           | `$state`   | New script creation mode         |
| `showAddSiteModal`      | `$state`   | Add site modal visibility        |
| `showAddSourceModal`    | `$state`   | Add source modal visibility      |

Derived state via `$derived`:

| Derived                    | Computes                                       |
|----------------------------|------------------------------------------------|
| `currentSite`              | Lookup site by currentSiteId                   |
| `currentScript`            | Lookup script by currentScriptId               |
| `currentSource`            | Lookup source by currentSourceId               |
| `currentSiteSourceScripts` | Source scripts matching current site domain    |

## Components

| Component           | Props/Purpose                                      |
|---------------------|----------------------------------------------------|
| `Sidebar`           | Navigation tabs, site list, source list            |
| `SitePanel`         | Site domain display, script list, CSP, delete      |
| `SettingsPanel`     | Enabled toggle, floating UI, auto-inject, headers  |
| `ScriptEditor`      | Textarea for code, name, type, autoRun, runAt      |
| `ScriptList`        | Renders ScriptItem rows with toggle + actions      |
| `ScriptItem`        | Single script row: name, type badge, toggle        |
| `SourcesPanel`      | Source list with refresh all, add, enable/disable  |
| `SourceDetails`     | Source URL, scripts, token input, refresh          |
| `AddSiteModal`      | Domain input with normalization                    |
| `AddSourceModal`    | GitHub URL + optional access token                 |
| `Toggle`            | Reusable on/off checkbox                           |
| `Modal`             | Generic modal wrapper with backdrop                |
| `Icon`              | SVG icon library component                         |
| `SettingRow`        | Labeled row for settings                           |
| `EmptyState`        | Placeholder for empty lists                        |

## Key Handlers

| Handler                              | Action                                       |
|--------------------------------------|----------------------------------------------|
| `loadSettings()`                     | Fetch from chrome.storage, update state      |
| `selectSite(id)`                     | Switch to site view                          |
| `selectScript(id)`                   | Open script in editor                        |
| `selectSourceScript(script)`         | View source script (read-only)               |
| `clearScriptView()`                  | Return from script editor to site panel      |
| `saveScript(data)`                   | Create new or update existing script         |
| `deleteScript()`                     | Delete current script (with confirmation)    |
| `deleteScriptFromList(scriptId)`     | Delete script from list view                 |
| `toggleScript(scriptId)`             | Toggle script enabled/disabled               |
| `handleAddSite(domain)`              | Add new site (normalize + dedup)             |
| `handleSelectDomain(domain)`         | Select or create site by domain              |
| `deleteSite()`                       | Delete current site (with confirmation)      |
| `toggleSiteCsp()`                    | Toggle CSP bypass for current site           |
| `handleAddSource(url, token)`        | Add GitHub source with optional token        |
| `deleteSource(sourceId)`             | Delete source (with confirmation)            |
| `handleRefreshSource()`              | Refresh current source from GitHub           |
| `handleRefreshAllSources()`          | Sync all sources with GitHub                 |
| `handleToggleSourceScript(scriptId)` | Toggle source script enabled                 |
| `handleUpdateSourceToken(token)`     | Update source GitHub token                   |
