<a name="TOC"></a>

<div align="center">
  <img height="80" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/public/icons/icon-128.png" alt="site-tweaker logo">
  <div><strong>Site Tweaker</strong></div>
  <br />
  <a href="#-overview">Overview</a> • <a href="#-features">Features</a> • <a href="#-quick-start">Quick Start</a> • <a href="#-usage">Usage</a> • <a href="#-sources">Sources</a> • <a href="#-contributing">Contributing</a> • <a href="#-license">License</a>
</div>

<div width="100%" align="center">
  <img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/divider.png" />
</div>

## 🎺 Overview<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

A browser extension to customize any website with custom scripts (JS) and styles (CSS). Inject code automatically on page load or run manually via a floating UI. Manage CSP headers, import scripts from GitHub repos, and organize everything by domain.

<div align="center">
  <a href="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo1.png" target="_blank"><img height="400" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo1.png" alt="Site Tweaker Editor"></a>
  <br>
  <em>manage scripts and styles per domain in the editor panel</em>
</div>

<br />

<div align="center">

<details>
<summary>Other images</summary>
<br />

<div align="center">
  <a href="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo2.png" target="_blank"><img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo2.png" alt="Floating UI"></a>
  <br>
  <em>floating UI panel for running scripts manually</em>
</div>

<br />

<div align="center">
  <a href="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo3.png" target="_blank"><img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo3.png" alt="Script in action"></a>
  <br>
  <em>example: auto-run script highlighting private repos on GitHub</em>
</div>

</details>

<details>
<summary>Use cases for this project</summary>
<br />

<div align="left">

- **Personalization** - Add dark mode, hide annoying elements, or customize layouts on any site
- **Productivity** - Automate repetitive tasks with custom scripts that run on specific pages
- **Development** - Test scripts and styles on production sites without modifying source code
- **Accessibility** - Inject custom CSS to improve readability or add missing accessibility features
- **Script Sharing** - Import and share script collections via GitHub repositories

</div>

</details>

</div>

## ⭐ Features<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

- **Per-Site Scripts** - Create JS and CSS scripts that run only on specific domains
- **Auto-Run or Manual** - Scripts can inject automatically on page load or run on-demand via floating UI
- **Path Matching** - Target specific pages with URL pattern matching (wildcards supported)
- **CSP Management** - Remove Content-Security-Policy headers to allow script injection on strict sites
- **GitHub Sources** - Import script collections from public or private GitHub repositories
- **Floating UI** - Quick access panel on any page to run manual scripts with one click
- **Full Editor** - Built-in code editor with syntax highlighting for JS and CSS
- **Import/Export** - Backup and restore all settings and scripts as JSON

## 🚀 Quick Start<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

### Installation

1. Clone the repository:

```bash
git clone https://github.com/lucasvtiradentes/site-tweaker.git
cd site-tweaker
```

2. Install dependencies and build:

```bash
pnpm install
pnpm build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development

```bash
pnpm dev    # Start development server with hot reload
pnpm build  # Build for production
pnpm zip    # Build and create zip for distribution
```

## 📖 Usage<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

<div align="center">

<details>
<summary><strong>Editor Panel</strong></summary>
<br />

<div align="left">

Access the editor by clicking the extension icon or right-clicking and selecting "Options".

**Sites Tab**
- Add sites by domain (e.g., `github.com`)
- Create multiple scripts per site
- Toggle scripts on/off individually
- Enable CSP bypass per site

**Script Settings**
- **Name** - Display name for the script
- **Type** - JavaScript or CSS
- **Auto-run** - Run automatically on page load
- **Run At** - When to inject: `document_start`, `document_end`, or `document_idle`
- **URL Patterns** - Restrict to specific paths (e.g., `*/settings/*`)

</div>

</details>

<details>
<summary><strong>Floating UI</strong></summary>
<br />

<div align="center">
  <a href="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo2.png" target="_blank"><img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/demo2.png" alt="Floating UI"></a>
  <br>
  <em>run scripts manually via floating panel</em>
</div>

<br />

<div align="left">

A small floating panel appears on pages that have manual scripts configured.

- Click the trigger button to expand the panel
- See all available manual scripts for the current page
- Click any script to execute it immediately
- Scripts with `autoRun: true` don't appear here (they run automatically)

**Note:** The floating UI only appears when there are manual scripts matching the current domain AND path.

</div>

</details>

<details>
<summary><strong>Settings</strong></summary>
<br />

<div align="left">

Global settings to control extension behavior:

- **Enabled** - Master toggle for the entire extension
- **Floating UI** - Show/hide the floating panel on pages
- **Auto-inject** - Enable automatic script injection
- **CSP Headers** - Configure which security headers to remove

</div>

</details>

</div>

## 📦 Sources<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

Import script collections from GitHub repositories. Sources are synced from a `site-tweaker.config.json` file in the repo.

### Adding a Source

1. Go to **Sources** in the editor
2. Click **Add Source**
3. Enter the GitHub repository URL
4. Optionally add a GitHub token for private repos
5. Scripts are automatically fetched and available

### Source Config Format

Create a `site-tweaker.config.json` in your repository:

```json
{
  "version": "1.0",
  "name": "My Scripts",
  "description": "Custom scripts for various sites",
  "scripts": [
    {
      "name": "Dark Mode",
      "type": "css",
      "file": "scripts/dark-mode.css",
      "autoRun": true,
      "match": {
        "domains": ["example.com", "*.example.com"],
        "paths": ["/app/*"]
      }
    },
    {
      "name": "Export Data",
      "type": "js",
      "file": "scripts/export-data.js",
      "autoRun": false,
      "match": {
        "domains": ["dashboard.example.com"],
        "paths": ["*?tab=reports"]
      }
    }
  ]
}
```

### Domain Matching

- `example.com` - Exact match
- `*.example.com` - Matches `example.com` and all subdomains

### Path Matching

- `/app/*` - Matches any path starting with `/app/`
- `*?tab=settings` - Matches any path with `?tab=settings` query
- Empty array matches all paths

## 🤝 Contributing<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
pnpm dev      # Development with hot reload
pnpm lint     # Check code style
pnpm lint:fix # Fix code style issues
```

## 📜 License<a href="#TOC"><img align="right" src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/up_arrow.png" width="22"></a>

MIT License - see [LICENSE](LICENSE) file for details.

<div width="100%" align="center">
  <img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/site-tweaker@main/.github/image/divider.png" />
</div>

<br />

<div align="center">
  <div>
    <a target="_blank" href="https://www.linkedin.com/in/lucasvtiradentes/"><img src="https://img.shields.io/badge/-linkedin-blue?logo=Linkedin&logoColor=white" alt="LinkedIn"></a>
    <a target="_blank" href="mailto:lucasvtiradentes@gmail.com"><img src="https://img.shields.io/badge/gmail-red?logo=gmail&logoColor=white" alt="Gmail"></a>
    <a target="_blank" href="https://x.com/lucasvtiradente"><img src="https://img.shields.io/badge/-X-black?logo=X&logoColor=white" alt="X"></a>
    <a target="_blank" href="https://github.com/lucasvtiradentes"><img src="https://img.shields.io/badge/-github-gray?logo=Github&logoColor=white" alt="Github"></a>
  </div>
</div>
