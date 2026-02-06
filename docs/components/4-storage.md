# 4. Storage and Data Model

Chrome storage layer with typed CRUD operations. All data persisted in `chrome.storage.local`.

## Data Model

```
┌───────────────────────────────────────────────────────────────────┐
│                        SETTINGS                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Settings {                                                       │
│    enabled: boolean                                               │
│    floatingUiEnabled: boolean                                     │
│    autoInjectEnabled: boolean                                     │
│    sites: Site[]                                                  │
│    sources: Source[]                                              │
│    headers: Headers                                               │
│  }                                                                │
│                                                                   │
│  Site {                                Source {                   │
│    id: string                             id: string              │
│    domain: string                         url: string             │
│    enabled: boolean                       name: string            │
│    cspEnabled: boolean                    enabled: boolean        │
│    scripts: Script[]                      token?: string          │
│    urlPatterns: string[]                  scripts: SourceScript[] │
│  }                                        lastUpdated?: string    │
│                                         }                         │
│                                                                   │
│  Script {                               SourceScript {            │
│    id: string                             id: string              │
│    name: string                           name: string            │
│    code: string                           code: string            │
│    type: 'js' | 'css'                     type: 'js' | 'css'      │
│    enabled: boolean                       enabled: boolean        │
│    autoRun: boolean                       autoRun: boolean        │
│    runAt: RunAt                           runAt: RunAt            │
│  }                                        match: {                │
│                                             domains: string[]     │
│  Headers {                                  paths: string[]       │
│    csp: boolean                           }                       │
│    cspReportOnly: boolean               }                         │
│    xFrameOptions: boolean                                         │
│    xContentTypeOptions: boolean                                   │
│    xXssProtection: boolean                                        │
│    permissionsPolicy: boolean                                     │
│  }                                                                │
│                                                                   │
│  RunAt = 'document_start' | 'document_end' | 'document_idle'      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Storage API (src/lib/storage.ts)

### Settings

| Function         | Signature                        | Purpose            |
|------------------|----------------------------------|--------------------|
| `getSettings()`  | `() → Promise<Settings>`         | Load from storage  |
| `saveSettings()` | `(s: Settings) → Promise<void>`  | Save full settings |

### Sites

| Function           | Signature                          | Purpose            |
|--------------------|------------------------------------|--------------------|
| `addSite()`        | `(domain: string) → Promise<Site>` | Create new site    |
| `updateSite()`     | `(site: Site) → Promise<void>`     | Update site        |
| `removeSite()`     | `(siteId: string) → Promise<void>` | Delete site        |
| `toggleSite()`     | `(siteId: string) → Promise<void>` | Toggle enabled     |
| `toggleSiteCsp()`  | `(siteId: string) → Promise<void>` | Toggle CSP removal |

### Scripts

| Function         | Signature                                     | Purpose           |
|------------------|-----------------------------------------------|-------------------|
| `addScript()`    | `(siteId, script: Script) → Promise<void>`    | Add to site       |
| `updateScript()` | `(siteId, script: Script) → Promise<void>`    | Update script     |
| `removeScript()` | `(siteId, scriptId: string) → Promise<void>`  | Delete script     |
| `toggleScript()` | `(siteId, scriptId: string) → Promise<void>`  | Toggle enabled    |

### Sources

| Function                | Signature                                        | Purpose              |
|-------------------------|--------------------------------------------------|----------------------|
| `addSource()`           | `(url, token?) → Promise<Source>`                | Add GitHub source    |
| `refreshSource()`       | `(sourceId: string) → Promise<void>`             | Sync with GitHub     |
| `toggleSourceScript()`  | `(sourceId, scriptId: string) → Promise<void>`   | Toggle source script |

### Queries

| Function                | Signature                              | Purpose                    |
|-------------------------|----------------------------------------|----------------------------|
| `getScriptsForDomain()` | `(domain: string) → Promise<Script[]>` | Get matching site scripts  |

## ID Generation

`generateId()` creates unique IDs using `crypto.randomUUID()` fallback to timestamp-based.

## Factory Functions

| Function         | Creates                               |
|------------------|---------------------------------------|
| `createScript()` | Script with defaults (enabled, js)    |
| `createSite()`   | Site with normalized domain           |
| `createSource()` | Source from GitHub URL                |

## Default Settings

```
enabled: true
floatingUiEnabled: true
autoInjectEnabled: true
sites: []
sources: []
headers: { all CSP headers enabled for blocking }
```
