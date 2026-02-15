# Usage

## Installation

### Local Development (Load Unpacked)

1. Clone and install dependencies:

```bash
git clone https://github.com/lucasvtiradentes/site-tweaker.git
cd site-tweaker
pnpm install
```

2. Start dev server:

```bash
pnpm dev
```

3. Load in Chrome/Edge:
   - Navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

The dev server supports hot reload - changes to source files auto-update the extension.

### Production Build

```bash
pnpm build
```

Output goes to `dist/` (flattened, no chrome-mv3 subfolder). Load this folder as unpacked extension for testing production builds.

### Distributable Zip

```bash
pnpm zip
```

Creates a zip file ready for Chrome Web Store submission.

## Configuration

### Global Settings

Open the editor page (click extension icon or right-click → Options):

| Setting          | Default | Purpose                              |
|------------------|---------|--------------------------------------|
| Enabled          | true    | Master toggle for all injection      |
| Floating UI      | true    | Show floating panel on pages         |
| Auto Inject      | true    | Auto-run scripts on page load        |

### Adding a Site

1. Click "Add Site" in the sidebar
2. Enter the domain (e.g., `github.com` or `*.example.com`)
3. The site appears in the sidebar with its own config

### Site Options

| Option      | Purpose                                        |
|-------------|------------------------------------------------|
| Enabled     | Toggle all scripts for this site               |
| CSP Enabled | Remove CSP headers to allow script injection   |

### Adding Scripts

1. Select a site in the sidebar
2. Click "Add Script"
3. Configure:

| Field        | Options                                | Default        |
|--------------|----------------------------------------|----------------|
| Name         | Free text                              | "New Script"   |
| Code         | JavaScript code                        | empty          |
| Enabled      | Toggle on/off                          | true           |
| Auto Run     | Inject on page load                    | false          |
| URL Patterns | Glob/regex patterns to limit injection | [] (all pages) |
| CSP Bypass   | Domain patterns for fetch proxy        | [] (disabled)  |

### Script Execution

Scripts run in two modes:

| Mode        | Trigger                   | Requires           |
|-------------|---------------------------|---------------------|
| Auto Run    | Page load (background)    | autoRun: true       |
| Manual      | Click in Floating UI      | autoRun: false      |

JS injection uses blob URLs to bypass Content Security Policy. Scripts can also specify CSP bypass domains to proxy fetch() requests and avoid CSP console errors.

### CSP Bypass

When CSP is enabled for a site, the extension removes these headers via declarativeNetRequest:

- content-security-policy
- content-security-policy-report-only
- x-webkit-csp
- x-content-security-policy
- x-content-security-policy-report-only
- x-webkit-csp-report-only
- report-to
- reporting-endpoints

Each header type can be individually toggled in Settings.

### CSP Bypass Fetch Proxy

Scripts can specify domain patterns in the `cspBypass` field to proxy fetch() requests through the extension background, avoiding CSP console errors:

- Add domain patterns like `api.example.com` or `*.example.com`
- Fetch requests to these domains use a message-based proxy
- No CSP errors logged in console
- Supports wildcard subdomains

## GitHub Sources

Sources let you load scripts from a GitHub repository.

### Setup

1. Click "Add Source" in the sidebar
2. Enter a GitHub repository URL (e.g., `https://github.com/user/repo`)
3. Optionally add a personal access token for private repos
4. Click "Add" - the extension fetches the config and scripts

### Config File

The repository must have a `site-tweaker.config.json` at the root:

```json
{
  "version": "1.0.0",
  "name": "My Scripts",
  "description": "Custom scripts collection",
  "env": [
    {
      "key": "API_KEY",
      "description": "API key for external service"
    }
  ],
  "scripts": [
    {
      "name": "Dark Mode",
      "file": "scripts/dark-mode.js",
      "autoRun": true,
      "match": {
        "domains": ["github.com", "*.gitlab.com"],
        "paths": ["/settings/*", "^/users/\\d+"]
      },
      "cspBypass": ["api.github.com", "*.example.com"]
    }
  ]
}
```

### Domain Matching

| Pattern            | Matches                                 |
|--------------------|-----------------------------------------|
| `github.com`       | Exact domain                            |
| `*.example.com`    | Any subdomain of example.com            |

### Path Matching

| Pattern            | Type   | Matches                              |
|--------------------|--------|--------------------------------------|
| `/app/*`           | Glob   | /app/anything                        |
| `*?tab=settings`   | Glob   | Any URL with tab=settings param      |
| `^/users/\d+`      | Regex  | /users/123, /users/456               |

### Environment Variables

Sources can define environment variables that scripts can access:

1. Define `env` array in config with key and optional description
2. Set values in the source settings in the editor
3. Access in scripts via `window.__ST_ENV__` object

### Refreshing Sources

Click the refresh button on a source to re-fetch the config and all scripts from GitHub. Sources can also be refreshed individually or all at once from the editor.

## Floating UI

The floating panel appears on pages that have configured scripts:

- Bottom-right corner of the page
- Shows manual (non-autoRun) scripts for the current domain
- Click a script to execute it
- Isolated via Shadow DOM (no style conflicts with host page)
- Responds to SPA navigation (URL changes without full page reload)

## Development Commands

| Command          | Purpose                        |
|------------------|--------------------------------|
| `pnpm dev`       | WXT dev server with hot reload |
| `pnpm build`     | Production build               |
| `pnpm zip`       | Build + distributable zip      |
| `pnpm lint`      | Biome linter                   |
| `pnpm lint:fix`  | Biome linter with auto-fix     |
| `pnpm format`    | Biome formatter                |
| `pnpm icons`     | Generate icons from source SVG |
| `pnpm prepare`   | Setup husky git hooks          |

## Requirements

| Tool   | Version |
|--------|---------|
| Node   | 22+     |
| pnpm   | latest  |
