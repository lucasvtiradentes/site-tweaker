# 1. Background Service Worker

Central hub for extension logic. Handles CSP removal, script injection, context menus, and icon state.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND SERVICE WORKER                        │
│                    (src/entrypoints/background.ts)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CSP MANAGEMENT:                                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  updateCspRules()                                             │  │
│  │  ├── Collect domains with CSP enabled                         │  │
│  │  ├── Build declarativeNetRequest rules                        │  │
│  │  └── Remove configured CSP headers from responses             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  SCRIPT INJECTION:                                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  injectScript(tabId, script, envValues?)                      │  │
│  │  ├── Prepend CSP bypass client code (fetch proxy)             │  │
│  │  ├── Inject envValues as window.__ST_ENV__                    │  │
│  │  └── JS: blob URL → chrome.scripting.executeScript (MAIN)     │  │
│  │                                                               │  │
│  │  injectAutoRunScripts(tabId, url)                             │  │
│  │  ├── Match domain against sites + sources                     │  │
│  │  ├── Filter autoRun=true scripts                              │  │
│  │  ├── Deduplicate via lastInjectedUrl map                      │  │
│  │  └── Execute matching scripts with envValues                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  MANUAL EXECUTION:                                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  executeManualScript(siteId, scriptId, tabId)                 │  │
│  │  executeSourceScript(sourceId, scriptId, tabId)               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  CONTEXT MENUS:                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  updateContextMenu(tabId, url)                                │  │
│  │  ├── Build right-click menu for manual scripts                │  │
│  │  └── Separate entries for site scripts and source scripts     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ICON STATE:                                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  updateIconForTab(tabId, url)                                 │  │
│  │  ├── active   → has scripts for current domain                │  │
│  │  ├── outline  → no scripts but extension enabled              │  │
│  │  └── disabled → extension globally disabled                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Event Listeners

| Listener                                       | Purpose                                    |
|------------------------------------------------|--------------------------------------------|
| `chrome.tabs.onUpdated`                        | Inject scripts + update icon on page load  |
| `chrome.webNavigation.onCommitted`             | Track navigation for deduplication         |
| `chrome.webNavigation.onHistoryStateUpdated`   | SPA navigation detection + URL_CHANGED msg |
| `chrome.tabs.onActivated`                      | Update icon + context menu on tab switch   |
| `chrome.tabs.onRemoved`                        | Clean up lastInjectedUrl map               |
| `chrome.runtime.onMessage`                     | Handle messages + CSP bypass fetch proxy   |
| `chrome.contextMenus.onClicked`                | Execute script from context menu           |
| `chrome.storage.onChanged`                     | Refresh CSP rules on settings change       |

## CSP Header Removal

Uses `declarativeNetRequest` API to remove response headers:

```
Request to configured domain
           │
           ▼
declarativeNetRequest rule matches
           │
           ▼
Remove headers (configurable in Settings):
  content-security-policy
  content-security-policy-report-only
  x-webkit-csp
  x-content-security-policy
  x-content-security-policy-report-only
  x-webkit-csp-report-only
  report-to
  reporting-endpoints
           │
           ▼
Response arrives without CSP restrictions
```

Only active for domains with `cspEnabled: true` in site config or source script domains.

## Blob URL Injection

JS scripts bypass strict CSP via blob URL technique:

```
1. Generate CSP bypass client code (fetch proxy)
2. Prepend envValues as window.__ST_ENV__ (if any)
3. Prepend CSP bypass code to script code
4. Wrap full code in Blob object
5. Create blob URL: URL.createObjectURL(blob)
6. Inject via chrome.scripting.executeScript:
   • func: creates <script src="blob:..."> element
   • world: MAIN (page context, not isolated)
7. Clean up: URL.revokeObjectURL after load
```

## CSP Bypass Fetch Proxy

Scripts can use a fetch proxy to bypass CSP for specific domains via `script.cspBypass` array:

```
1. CSP bypass client code is prepended to every script
2. Client intercepts window.fetch for configured domains
3. Proxied requests sent via postMessage to content script
4. Content script forwards to background via CSP_BYPASS_FETCH
5. Background executes fetch (no CSP restrictions)
6. Response sent back through postMessage chain
7. Script receives response as if from native fetch
```


## URL Pattern Matching

Site scripts support URL pattern matching to target specific paths:

```
matchesUrlPatterns(url, patterns):
  • Empty patterns array → match all paths
  • Glob patterns: "/app/*" → match with wildcard
  • Simple prefix: "/settings" → startsWith match
  • Converts glob * to regex .* for matching
```

Pattern examples:
- `"/app/*"` - Matches `/app/dashboard`, `/app/settings/profile`, etc.
- `"/settings"` - Matches `/settings` and `/settings/profile`
- `"*?tab=reports"` - Matches any path with `?tab=reports` query param

## SPA Navigation Detection

Tracks `lastInjectedUrl` per tab to prevent duplicate injection:

| Event                                  | Action                                 |
|----------------------------------------|----------------------------------------|
| `webNavigation.onCommitted`            | Clear lastInjectedUrl for tab          |
| `webNavigation.onHistoryStateUpdated`  | Re-inject if URL changed               |
| `tabs.onUpdated (complete)`            | Inject if not already injected for URL |

## Message Handlers (Incoming)

| Message Type             | Action                                  | Sent By        |
|--------------------------|---------------------------------------- |----------------|
| `EXECUTE_SCRIPT`         | Run site script manually                | Floating UI    |
| `EXECUTE_SOURCE_SCRIPT`  | Run source script manually              | Floating UI    |
| `GET_SITE_DATA`          | Return site + source scripts for domain | Floating UI    |
| `GET_CURRENT_TAB_INFO`   | Return active tab URL and domain        | Editor, Popup  |
| `CSP_BYPASS_FETCH`       | Proxy fetch request to bypass CSP       | Page script    |

## Messages Sent (Outgoing)

| Message Type     | Trigger                                       |
|------------------|-----------------------------------------------|
| `URL_CHANGED`    | Sent to tabs on `onHistoryStateUpdated` (SPA) |
