# CI/CD

## Workflows

### Update Docs (.github/workflows/update-docs.yml)

Automated documentation maintenance using Claude Code CLI.

| Setting          | Value                                     |
|------------------|-------------------------------------------|
| Trigger          | Daily cron (03:00 UTC) + manual           |
| Runner           | ubuntu-latest                             |
| Timeout          | 15 minutes                                |
| Node             | 22                                        |
| Permissions      | contents: write, pull-requests: write     |

### Pipeline Steps

```
1. Checkout repo
2. Setup Node 22
3. Install Claude Code CLI (npm)
4. Run .github/scripts/run-claude.sh "/docs:update-docs"
   └── Claude reads all source + docs, updates outdated sections
5. Check for changes (git diff --quiet)
6. If changes exist:
   a. Generate PR description (file list + git stat)
   b. Create branch docs/auto-update-YYYYMMDD-HHMMSS
   c. Commit, push, open PR against main
```

### Secrets Required

| Secret                    | Purpose                          |
|---------------------------|----------------------------------|
| CLAUDE_CODE_OAUTH_TOKEN   | Authenticates Claude Code CLI    |
| GITHUB_TOKEN              | Auto-provided, creates PR        |

## Scripts

### run-claude.sh (.github/scripts/run-claude.sh)

Reusable wrapper that runs Claude Code with real-time streaming output. Designed for CI visibility.

Usage:

```bash
.github/scripts/run-claude.sh "<prompt or /command>"
```

Flags passed to Claude Code:

| Flag                             | Purpose                              |
|----------------------------------|--------------------------------------|
| --print                          | Non-interactive, pipe-friendly       |
| --verbose                        | Required for stream-json             |
| --dangerously-skip-permissions   | Bypass permission prompts in CI      |
| --output-format stream-json      | Emit JSON events per token           |
| --include-partial-messages       | Stream tokens as they arrive         |

### Streaming Output

Pipes Claude's stream-json through jq to display readable, color-coded output:

| Event                | Color  | Example                                          |
|----------------------|--------|--------------------------------------------------|
| Text tokens          | white  | `I'll update the documentation...`               |
| TodoWrite tool calls | blue   | `[tool] TodoWrite {"todos": [...]}`              |
| Edit tool calls      | orange | `[tool] Edit {"file_path": "docs/overview.md"}`  |
| Other tool calls     | green  | `[tool] Read {"file_path": "src/lib/storage.ts"}`|

### Claude Commands (.claude/commands/docs/)

| Command                  | File                  | Purpose                                          |
|--------------------------|-----------------------|--------------------------------------------------|
| /docs:update-docs        | update-docs.md        | Read all source + docs, update outdated sections |
| /docs:read-docs          | read-docs.md          | Warm-up: read all docs into context              |
| /docs:fix-docs-alignment | fix-docs-alignment.md | Fix table and ASCII diagram alignment            |

## Git Hooks

Pre-commit hook via husky + lint-staged:

```
git commit → husky pre-commit → lint-staged → biome check --write *.{ts,tsx,js,jsx,svelte}
```
