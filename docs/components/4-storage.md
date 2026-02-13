# 4. Storage and Data Model

Chrome storage layer with typed CRUD operations. All data persisted in `chrome.storage.local`.

## Data Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              SETTINGS                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Settings {                                                              │
│    enabled: boolean                                                      │
│    floatingUiEnabled: boolean                                            │
│    autoInjectEnabled: boolean                                            │
│    headers: Headers                                                      │
│    sites: Site[]                                                         │
│    sources: Source[]                                                     │
│  }                                                                       │
│                                                                          │
│  Site {                                 Source {                         │
│    id: string                             id: string                     │
│    domain: string                         url: string                    │
│    enabled: boolean                       token: string | null           │
│    cspEnabled: boolean                    name: string                   │
│    scripts: Script[]                      description: string            │
│  }                                        enabled: boolean               │
│                                           lastFetched: number | null     │
│                                           lastError: string | null       │
│  EnvVar {                                 version: string                │
│    key: string                            scripts: SourceScript[]        │
│    description?: string                   env: EnvVar[]                  │
│  }                                        envValues: Record<str, str>    │
│                                         }                                │
│                                                                          │
│  Script {                               SourceScript {                   │
│    id: string                             id: string                     │
│    name: string                           name: string                   │
│    code: string                           code: string                   │
│    enabled: boolean                       autoRun: boolean               │
│    autoRun: boolean                       domains: string[]              │
│    urlPatterns: string[]                  paths: string[]                │
│    cspBypass?: string[]                   enabled: boolean               │
│  }                                        sourceId: string               │
│                                           cspBypass?: string[]           │
│  Headers {                              }                                │
│    'content-security-policy': boolean                                    │
│    'content-security-policy-report-only': boolean                        │
│    'x-webkit-csp': boolean                                               │
│    'x-content-security-policy': boolean                                  │
│    'x-content-security-policy-report-only': boolean                      │
│    'x-webkit-csp-report-only': boolean                                   │
│    'report-to': boolean                                                  │
│    'reporting-endpoints': boolean                                        │
│  }                                                                       │
│                                                                          │
│  HeaderKey = keyof Headers                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Storage API (src/lib/storage.ts)

### Settings

| Function             | Signature                       | Purpose            |
|----------------------|---------------------------------|--------------------|
| `getSettings()`      | `() -> Promise<Settings>`       | Load from storage  |
| `saveSettings()`     | `(s: Settings) -> Promise<void>`| Save full settings |
| `toggleGlobal()`     | `() -> Promise<boolean>`        | Toggle enabled     |
| `toggleFloatingUi()` | `() -> Promise<boolean>`        | Toggle floating UI |
| `toggleAutoInject()` | `() -> Promise<boolean>`        | Toggle auto-inject |

### Sites

| Function            | Signature                                                     | Purpose             |
|---------------------|---------------------------------------------------------------|---------------------|
| `getSiteByDomain()` | `(domain: string) -> Promise<Site or undefined>`              | Find site by domain |
| `addSite()`         | `(domain: string) -> Promise<Site>`                           | Create new site     |
| `updateSite()`      | `(siteId, updates: Partial<Site>) -> Promise<Site or null>`   | Update site fields  |
| `removeSite()`      | `(siteId: string) -> Promise<void>`                           | Delete site         |
| `toggleSite()`      | `(siteId: string) -> Promise<boolean>`                        | Toggle enabled      |
| `toggleSiteCsp()`   | `(siteId: string) -> Promise<boolean>`                        | Toggle CSP removal  |

### Scripts

| Function         | Signature                                                       | Purpose        |
|------------------|-----------------------------------------------------------------|----------------|
| `addScript()`    | `(siteId, script?: Partial<Script>) -> Promise<Script or null>` | Add to site    |
| `updateScript()` | `(siteId, scriptId, updates) -> Promise<Script or null>`        | Update script  |
| `removeScript()` | `(siteId, scriptId: string) -> Promise<void>`                   | Delete script  |
| `toggleScript()` | `(siteId, scriptId: string) -> Promise<boolean>`                | Toggle enabled |

### Sources

| Function                   | Signature                                                        | Purpose                      |
|----------------------------|------------------------------------------------------------------|------------------------------|
| `addSource()`              | `(url: string, token: string or null) -> Promise<Source>`        | Add GitHub source            |
| `removeSource()`           | `(sourceId: string) -> Promise<void>`                            | Delete source                |
| `toggleSource()`           | `(sourceId: string) -> Promise<boolean>`                         | Toggle source enabled        |
| `refreshSource()`          | `(sourceId: string) -> Promise<Source or null>`                  | Sync with GitHub             |
| `refreshAllSources()`      | `() -> Promise<void>`                                            | Sync all sources             |
| `toggleSourceScript()`     | `(sourceId, scriptId: string) -> Promise<boolean>`               | Toggle source script         |
| `getSourceById()`          | `(sourceId: string) -> Promise<Source or undefined>`             | Find source by ID            |
| `updateSourceToken()`      | `(sourceId, token: string or null) -> Promise<Source or null>`   | Update GitHub token          |
| `updateSourceEnvValues()`  | `(sourceId, envValues: Record) -> Promise<Source or null>`       | Update environment variables |

### Queries

| Function                   | Signature                                      | Purpose                        |
|----------------------------|------------------------------------------------|--------------------------------|
| `getScriptsForDomain()`    | `(domain) -> Promise<{site, scripts} or null>` | Get site + enabled scripts     |
| `getMatchingSourceScripts` | Re-exported from sources.ts                    | Filter source scripts by match |
| `normalizeDomain`          | Re-exported from utils.ts                      | Normalize domain string        |

## ID Generation

`generateId()` creates unique IDs using `Math.random().toString(36).substring(2, 9)`.

## Factory Functions (src/lib/configs.ts)

| Function         | Creates                                                    |
|------------------|------------------------------------------------------------|
| `createScript()` | Script with defaults (enabled, autoRun=false)              |
| `createSite()`   | Site with domain (enabled, cspEnabled=false, no scripts)   |
| `createSource()` | Source from URL + optional token (no name/scripts yet)     |

## Default Settings

```
enabled: true
floatingUiEnabled: true
autoInjectEnabled: true
sites: []
sources: []
headers: { all 8 CSP headers enabled for removal }
```
