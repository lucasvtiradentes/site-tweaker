# 5. GitHub Source Integration

Import script collections from GitHub repositories. Supports private repos via access tokens.

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                    GITHUB SOURCES                                 │
│                  (src/lib/sources.ts)                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ADD SOURCE:                                                      │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────┐             │
│  │  Parse   │──►│  Fetch       │──►│  Download      │             │
│  │  GitHub  │   │  config.json │   │  script files  │             │
│  │  URL     │   │  from repo   │   │  (base64)      │             │
│  └──────────┘   └──────────────┘   └────────────────┘             │
│                                                                   │
│  REFRESH SOURCE:                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────┐             │
│  │  Use     │──►│  Re-fetch    │──►│  Re-download   │             │
│  │  stored  │   │  config.json │   │  all scripts   │             │
│  │  URL     │   │              │   │                │             │
│  └──────────┘   └──────────────┘   └────────────────┘             │
│                                                                   │
│  MATCHING:                                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  getMatchingSourceScripts(sources, domain, path)            │  │
│  │  ├── matchesDomainPattern(domain, pattern)                  │  │
│  │  │   ├── Exact: "example.com"                               │  │
│  │  │   └── Wildcard: "*.example.com"                          │  │
│  │  └── matchesPathPattern(path, pattern)                      │  │
│  │      ├── Glob: "/app/*", "*?tab=settings"                   │  │
│  │      └── Regex: "^/users/\\d+"                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Config File Format

Repos must contain `site-tweaker.config.json` at root:

```json
{
  "version": "1.0",
  "name": "Collection Name",
  "description": "Optional description",
  "env": [
    {
      "key": "API_KEY",
      "description": "API key for service"
    }
  ],
  "scripts": [
    {
      "name": "Display Name",
      "file": "path/to/script.js",
      "autoRun": true,
      "match": {
        "domains": ["example.com", "*.example.com"],
        "paths": ["/app/*", "*?tab=settings"]
      },
      "cspBypass": ["api.example.com", "*.cdn.example.com"]
    }
  ]
}
```

## Key Functions

| Function                                           | Purpose                                         |
|----------------------------------------------------|-------------------------------------------------|
| `parseGitHubUrl(url)`                              | Extract owner, repo, branch, path from URL      |
| `validateSourceConfig(config)`                     | Validate config schema (version, name, scripts) |
| `fetchSourceConfig(parsed, token?)`                | Download and validate config.json               |
| `fetchScriptFile(parsed, file, token?)`            | Download script file (base64 decode)            |
| `refreshSource(source)`                            | Re-fetch config + all script files              |
| `getMatchingSourceScripts(sources, domain, path)`  | Filter source scripts by domain + path          |
| `matchesDomainPattern(domain, pattern)`            | Domain match with wildcard support              |
| `matchesPathPattern(path, patterns)`               | Path match with glob and regex support          |
| `getDisplayUrl(url)`                               | Short display format (owner/repo)               |

## GitHub API

Uses GitHub Contents API to fetch files:

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}
Accept: application/vnd.github.v3+json
Authorization: Bearer {github_token}  (if private repo)
```

Response content is base64-encoded, decoded via `atob()` + `TextDecoder('utf-8')`.

## Domain Pattern Matching

| Pattern            | Matches                                |
|--------------------|----------------------------------------|
| `example.com`      | Exact domain match                     |
| `*.example.com`    | Any subdomain of example.com           |
| `www.example.com`  | Exact subdomain match                  |

## Path Pattern Matching

| Pattern             | Type   | Matches                             |
|---------------------|--------|-------------------------------------|
| `/app/*`            | Glob   | Any path starting with /app/        |
| `*?tab=settings`    | Glob   | Any path with ?tab=settings         |
| `^/users/\d+`       | Regex  | Regex pattern (starts with ^)       |
| (empty/none)        | -      | All paths on matching domain        |

## Refresh Flow

```
User clicks refresh
        │
        ▼
Re-fetch site-tweaker.config.json
        │
        ▼
Validate schema (version, scripts array)
        │
        ▼
Download each script file referenced in config
        │
        ▼
Update source.scripts[] with new code
        │
        ▼
Set source.lastFetched timestamp
        │
        ▼
Save to chrome.storage.local
```

## Private Repos

Optional GitHub token stored per source. Token included in API requests as `Authorization: Bearer {token}` header. Token managed via SourceDetails component in editor.

## Environment Variables

Sources can define environment variables that scripts access at runtime:

```
1. Config defines env: [{ key, description }]
2. User sets envValues in editor UI per source
3. Background injects window.__ST_ENV__ = {key: value} before script
4. Script accesses values via window.__ST_ENV__.API_KEY
```

## CSP Bypass Domains

Scripts can specify domains for CSP-bypassed fetch:

```
1. Config sets cspBypass: ["api.example.com", "*.cdn.com"]
2. CSP bypass client code prepended to script
3. window.fetch intercepted for matching domains
4. Requests proxied through content script → background
5. Background performs fetch without CSP restrictions
6. Response returned to script
```

This prevents CSP console errors for cross-origin API calls.
