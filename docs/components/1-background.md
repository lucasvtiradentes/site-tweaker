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
│  │  injectScript(tabId, script)                                  │  │
│  │  └── JS: blob URL → chrome.scripting.executeScript (MAIN)     │  │
│  │                                                               │  │
│  │  injectAutoRunScripts(tabId, url)                             │  │
│  │  ├── Match domain against sites + sources                     │  │
│  │  ├── Filter autoRun=true scripts                              │  │
│  │  ├── Deduplicate via lastInjectedUrl map                      │  │
│  │  └── Execute matching scripts                                 │  │
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
│  │  ├── active   → has scripts for current domain (filled)       │  │
│  │  ├── outline  → extension enabled, no scripts (outline)       │  │
│  │  └── disabled → extension globally disabled (grayscale)       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  CSP BYPASS PROXY:                                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  handleCspBypassFetch(url, method, headers, body)             │  │
│  │  └── Executes fetch from background to bypass page CSP        │  │
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
| `chrome.runtime.onMessage`                     | Handle messages from content scripts       |
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
1. Wrap script code in Blob object
2. Create blob URL: URL.createObjectURL(blob)
3. Inject via chrome.scripting.executeScript:
   • func: creates <script src="blob:..."> element
   • world: MAIN (page context, not isolated)
4. Clean up: URL.revokeObjectURL after load
```

### CSP Bypass Proxy

Scripts can optionally specify domains that require CSP bypass for fetch requests:

```
Page Script (MAIN world)
  ├── User code calls fetch(url)
  │
  ├── generateCspBypassCode() prepended to script
  │   └── Intercepts fetch for configured domains
  │
  ├── Posts ST_FETCH_PROXY_REQUEST to window
  │
  └── Receives ST_FETCH_PROXY_RESPONSE with data

Content Script (csp-bypass.content)
  ├── Listens for ST_FETCH_PROXY_REQUEST
  │
  ├── Sends CSP_BYPASS_FETCH to background
  │
  └── Posts ST_FETCH_PROXY_RESPONSE back to page

Background Service Worker
  └── Executes actual fetch (no CSP restrictions)
```

Environment variables from sources are injected as constants at the top of the script code before CSP bypass code.


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
| `CSP_BYPASS_FETCH`       | Proxy fetch request (bypass CSP)        | CSP Bypass     |

## Messages Sent (Outgoing)

| Message Type     | Trigger                                       |
|------------------|-----------------------------------------------|
| `URL_CHANGED`    | Sent to tabs on `onHistoryStateUpdated` (SPA) |
