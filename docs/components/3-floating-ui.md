# 3. Floating UI (Content Script)

Injected panel on web pages for quick manual script execution. Uses Shadow DOM for style isolation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLOATING UI                                     │
│            (src/entrypoints/floating-ui.content/)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INITIALIZATION (index.ts):                                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  1. Query background for site data (MSG.GET_SITE_DATA)        │  │
│  │  2. Filter for manual (non-autoRun) scripts only              │  │
│  │  3. If manual scripts exist:                                  │  │
│  │     ├── Create container div                                  │  │
│  │     ├── Attach shadow DOM (mode: open)                        │  │
│  │     ├── Inject styles from style.css?inline                   │  │
│  │     └── Mount Svelte App component                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  UI (App.svelte):                                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌─────┐   ┌─────────────────────────────────────┐            │  │
│  │  │ [S] │   │ Scripts             [x]             │            │  │
│  │  │     │   │                                     │            │  │
│  │  │ btn │   │  > My Script        JS              │            │  │
│  │  │     │   │  > Source Script   SRC  CSS         │            │  │
│  │  │     │   │  > Another Script   JS              │            │  │
│  │  └─────┘   └─────────────────────────────────────┘            │  │
│  │  (trigger)  (expandable panel)                                │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  POSITION: bottom: 20px, right: 20px, z-index: 2147483647           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Content Script Config

| Property             | Value                             |
|----------------------|-----------------------------------|
| `matches`            | `<all_urls>`                      |
| `runAt`              | `document_idle`                   |
| `cssInjectionMode`   | `manual` (via shadow DOM)         |
| `registration`       | `runtime` (conditional injection) |

## State

| Variable          | Type     | Purpose                          |
|-------------------|----------|----------------------------------|
| `isOpen`          | `$state` | Panel expanded/collapsed         |
| `runningScriptId` | `$state` | Currently executing script (UX)  |

## Dynamic Updates

| Trigger                      | Action                            |
|------------------------------|-----------------------------------|
| `chrome.storage.onChanged`   | Reinitialize (settings changed)   |
| `MSG.URL_CHANGED`            | Reinitialize (SPA navigation)     |
| `DOMContentLoaded`           | Init if page still loading        |

## Script Execution

```
User clicks play button on script
           │
           ▼
Send message to background:
  MSG.EXECUTE_SCRIPT (site script)
  MSG.EXECUTE_SOURCE_SCRIPT (source script)
           │
           ▼
Background looks up script, injects via chrome.scripting
           │
           ▼
Script runs in page context (MAIN world)
```

## Style Isolation

Shadow DOM prevents host page styles from affecting the panel and vice versa. Styles imported inline from `style.css` at build time via `?inline` suffix.
