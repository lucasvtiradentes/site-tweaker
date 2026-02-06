# ABOUT THE PROJECT

site-tweaker is a Chrome/Edge extension that lets users inject custom JavaScript and CSS on any website with domain-specific management, CSP bypass, and GitHub source integration.

Built with WXT (Chrome extension bundler), Svelte 5, Tailwind CSS, TypeScript.

Flow: User configures sites/scripts in Editor → Background service worker matches domain on page load → Injects JS (blob URL) / CSS into page → Floating UI for manual execution

## Key Components

| Component   | Location                             | Purpose                                |
|-------------|--------------------------------------|----------------------------------------|
| Background  | src/entrypoints/background.ts        | Service worker: CSP, injection, menus  |
| Editor      | src/entrypoints/editor/              | Options page: Svelte 5 UI              |
| Floating UI | src/entrypoints/floating-ui.content/ | Content script: manual script panel    |
| Popup       | src/entrypoints/popup/               | Opens editor page                      |
| Lib         | src/lib/                             | Core: configs, storage, sources, utils |

## Data Model

| Type         | Key Fields                                                                       |
|--------------|----------------------------------------------------------------------------------|
| Settings     | enabled, floatingUiEnabled, autoInjectEnabled, sites, sources, headers           |
| Site         | id, domain, enabled, cspEnabled, scripts                                         |
| Script       | id, name, code, type (js/css), enabled, autoRun, runAt, urlPatterns              |
| Source       | id, url, token, name, description, enabled, lastFetched, lastError, version      |
| SourceScript | id, name, code, type, autoRun, runAt, domains[], paths[], enabled, sourceId      |

## Manifest Permissions

| Permission              | Purpose                             |
|-------------------------|-------------------------------------|
| `storage`               | Persist settings via chrome.storage |
| `tabs`                  | Access tab info and execute scripts |
| `scripting`             | Execute scripts via chrome.scripting |
| `declarativeNetRequest` | Modify response headers (CSP)       |
| `contextMenus`          | Right-click menu for manual scripts |
| `webNavigation`         | Track page navigation and SPA       |
| `<all_urls>`            | Host permission for all sites       |

# COMMANDS

<project_commands>
  <command name="dev" cmd="pnpm dev" where="root" description="WXT dev server with hot reload" />
  <command name="build" cmd="pnpm build" where="root" description="Production build (chrome-mv3)" />
  <command name="zip" cmd="pnpm zip" where="root" description="Build + distributable zip" />
  <command name="lint" cmd="pnpm lint" where="root" description="Biome linter" />
  <command name="lint:fix" cmd="pnpm lint:fix" where="root" description="Biome linter with auto-fix" />
  <command name="format" cmd="pnpm format" where="root" description="Biome formatter" />
  <command name="icons" cmd="pnpm icons" where="root" description="Generate icons from source" />
</project_commands>

# RULES

- JS injection uses blob URL technique to bypass CSP
- CSS uses direct chrome.scripting.insertCSS (no CSP issues)
- Shadow DOM isolates Floating UI styles from host page
- GitHub sources require `site-tweaker.config.json` at repo root
- Domain matching supports exact and wildcard (`*.example.com`)
- Path matching supports glob (`/app/*`) and regex (`^/users/\d+`)

# DOCUMENTATION

Detailed docs available in `docs/` folder:

- overview.md                - Architecture, data flow, file structure, dependencies
- usage.md                   - Installation, configuration, usage guide
- cicd.md                    - CI/CD workflows, scripts, git hooks
- components/1-background.md - Service worker: CSP, injection, menus, SPA detection
- components/2-editor.md     - Editor UI: views, state, components, handlers
- components/3-floating-ui.md - Floating panel: shadow DOM, script execution
- components/4-storage.md    - Data model, storage API, factory functions
- components/5-sources.md    - GitHub integration, pattern matching, config format

IMPORTANT: Before making significant changes to any component, FIRST read the relevant documentation to understand the current architecture and conventions.
