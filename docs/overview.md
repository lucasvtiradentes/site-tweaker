# Overview

Browser extension (Chrome/Edge) that lets users inject custom JavaScript and CSS on any website with domain-specific management, CSP bypass, and GitHub source integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SITE TWEAKER ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                ┌────────────────────┐                ┌────────────┐
│   Editor     │ ◄────────────► │    Background      │ ──────────────►│  Web Page  │
│   (Options)  │    events      │   Service Worker   │  inject JS/CSS │            │
│              │                │                    │                │            │
│  Svelte 5    │                │  • CSP removal     │                │  ┌──────┐  │
│  Tailwind    │                │  • Script inject   │                │  │Float │  │
│              │                │  • Context menus   │ content script │  │ UI   │  │
└──────────────┘                │  • Icon state      │ ──────────────►│  └──────┘  │
                                └──────┬─────────────┘                └────────────┘
                                       │
                                       │ chrome.storage.local
                                       ▼
                              ┌────────────────────┐
                              │      Storage       │
                              │                    │
                              │  • Sites[]         │
                              │  • Scripts[]       │
                              │  • Sources[]       │
                              │  • Settings        │
                              └────────────────────┘

                              ┌────────────────────┐
                              │    GitHub API      │
                              │                    │
                              │  Fetch configs     │
                              │  + script files    │
                              │  from repos        │
                              └────────────────────┘
```

## Data Flow

```
1. PAGE LOAD
   User navigates to website
                     │
                     ▼
2. BACKGROUND
   chrome.tabs.onUpdated / webNavigation fires
   • Match domain against configured sites
   • Filter auto-run enabled scripts
   • Match source scripts by domain + path
                     │
                     ▼
3. INJECTION
   chrome.scripting.executeScript / insertCSS
   • JS: blob URL injection (bypasses CSP)
   • CSS: direct insertion
   • World: MAIN (page context)
                     │
                     ▼
4. FLOATING UI (optional)
   Content script injects shadow DOM panel
   • Shows manual (non-autoRun) scripts
   • Sends MSG.EXECUTE_SCRIPT to background
                     │
                     ▼
5. CSP BYPASS
   declarativeNetRequest removes CSP headers
   • Only for domains with CSP toggle enabled
   • Configurable header types
```

## Key Configuration

### Manifest Permissions

| Permission               | Purpose                              |
|--------------------------|--------------------------------------|
| `storage`                | Persist settings via chrome.storage  |
| `tabs`                   | Access tab info and execute scripts  |
| `scripting`              | Execute scripts via chrome.scripting |
| `declarativeNetRequest`  | Modify response headers (CSP)        |
| `contextMenus`           | Right-click menu for manual scripts  |
| `webNavigation`          | Track page navigation and SPA        |
| `<all_urls>`             | Host permission for all sites        |

### Build

| Command        | Purpose                        |
|----------------|--------------------------------|
| `pnpm dev`     | WXT dev server with hot reload |
| `pnpm build`   | Production build (chrome-mv3)  |
| `pnpm zip`     | Build + distributable zip      |
| `pnpm lint`    | Biome linter                   |
| `pnpm format`  | Biome formatter                |
| `pnpm icons`   | Generate icons from source     |

### Dependencies

| Package      | Version  | Purpose                  |
|--------------|----------|--------------------------|
| wxt          | ^0.20.5  | Chrome extension bundler |
| svelte       | ^5.19.0  | UI component framework   |
| tailwindcss  | ^4.0.0   | Utility-first CSS        |
| typescript   | ^5.7.2   | Type safety              |
| biome        | ^1.9.4   | Linting and formatting   |

## File Structure

```
site-tweaker/
├── src/
│   ├── lib/
│   │   ├── constants.ts              # APP_NAME, PACKAGE_NAME, CONFIG_FILE
│   │   ├── configs.ts                # Types: Script, Site, Source, Settings
│   │   ├── storage.ts                # Chrome storage CRUD operations
│   │   ├── sources.ts                # GitHub integration + pattern matching
│   │   ├── messages.ts               # Inter-component message types
│   │   └── utils.ts                  # Domain extraction, date formatting
│   │
│   ├── assets/
│   │   └── app.css                   # Global Tailwind styles
│   │
│   └── entrypoints/
│       ├── background.ts             # Service worker (CSP, injection, menus)
│       ├── popup/
│       │   └── main.ts               # Opens editor page
│       ├── editor/
│       │   ├── main.ts               # Svelte mount point
│       │   ├── index.html            # Editor HTML shell
│       │   ├── App.svelte            # Main editor component (state + routing)
│       │   └── components/
│       │       ├── Sidebar.svelte    # Navigation: Settings, Sites, Sources
│       │       ├── SitePanel.svelte  # Site domain, scripts, CSP toggle
│       │       ├── SettingsPanel.svelte # Global toggles and CSP headers
│       │       ├── ScriptEditor.svelte  # Code editor + metadata form
│       │       ├── ScriptList.svelte    # Scripts list with toggles
│       │       ├── ScriptItem.svelte    # Single script row
│       │       ├── SourcesPanel.svelte  # GitHub sources list
│       │       ├── SourceDetails.svelte # Source info + scripts
│       │       ├── AddSiteModal.svelte  # Add site dialog
│       │       ├── AddSourceModal.svelte # Add GitHub source dialog
│       │       ├── Toggle.svelte        # Reusable toggle
│       │       ├── Modal.svelte         # Generic modal wrapper
│       │       ├── Icon.svelte          # Icon library
│       │       ├── SettingRow.svelte    # Labeled setting row
│       │       ├── EmptyState.svelte    # Empty list placeholder
│       │       └── index.ts            # Component barrel export
│       └── floating-ui.content/
│           ├── index.ts              # Content script entry (shadow DOM)
│           ├── App.svelte            # Floating panel component
│           └── style.css             # Isolated panel styles
│
├── docs/
│   ├── overview.md                   # This file
│   └── components/
│       ├── 1-background.md           # Service worker details
│       ├── 2-editor.md               # Editor UI details
│       ├── 3-floating-ui.md          # Floating panel details
│       ├── 4-storage.md              # Data model + storage layer
│       └── 5-sources.md              # GitHub source integration
│
├── public/
│   └── icons/                        # Extension icons (PNG + SVG)
│
├── package.json
├── wxt.config.ts                     # WXT bundler config
├── tsconfig.json
├── biome.json                        # Linter/formatter config
└── README.md
```
