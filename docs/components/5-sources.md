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
│  │  getMatchingSourceScripts(domain, path, sources)            │  │
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
  "scripts": [
    {
      "name": "Display Name",
      "type": "js",
      "file": "path/to/script.js",
      "autoRun": true,
      "runAt": "document_end",
      "match": {
        "domains": ["example.com", "*.example.com"],
        "paths": ["/app/*", "*?tab=settings"]
      }
    }
  ]
}
```

## Key Functions

| Function                           | Purpose                                     |
|------------------------------------|---------------------------------------------|
| `parseGitHubUrl(url)`              | Extract owner, repo, branch from GitHub URL |
| `fetchSourceConfig(url, token?)`   | Download and validate config.json           |
| `fetchScriptFile(url, token?)`     | Download script file (base64 decode)        |
| `refreshSource(source)`            | Re-fetch config + all script files          |
| `getMatchingSourceScripts()`       | Filter source scripts by domain + path      |
| `matchesDomainPattern()`           | Domain match with wildcard support          |
| `matchesPathPattern()`             | Path match with glob and regex support      |

## GitHub API

Uses GitHub Contents API to fetch files:

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}
Authorization: token {github_token}  (if private repo)
```

Response content is base64-encoded, decoded via `atob()`.

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
Set source.lastUpdated timestamp
        │
        ▼
Save to chrome.storage.local
```

## Private Repos

Optional GitHub token stored per source. Token included in API requests as `Authorization: token {token}` header. Token managed via SourceDetails component in editor.
