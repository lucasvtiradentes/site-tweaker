# Update Documentation

Read ALL source files in this repository and update documentation accordingly.

## Instructions

1. Read ALL files from these folders (in parallel):
   - `src/lib/` - Core library (configs, storage, sources, messages, utils, constants)
   - `src/entrypoints/background.ts` - Service worker
   - `src/entrypoints/editor/` - Editor page (App.svelte + all components)
   - `src/entrypoints/floating-ui.content/` - Floating UI content script
   - `src/entrypoints/popup/` - Popup entry

2. Also read root files:
   - `package.json`
   - `wxt.config.ts`
   - `README.md`
   - `CLAUDE.md`

3. Read ALL docs in `docs/` folder

4. Compare docs vs code, update outdated sections

## Folders to Skip

- `.git/`, `.claude/`, `node_modules/`, `.wxt/`, `.output/`
- `dist/`, `*.lock`, `*.lock.yaml`
- Binary files (images, icons)

## What to Update

- File structure diagrams (must match actual folders/files)
- Types and interfaces (must match configs.ts)
- Function signatures (must match storage.ts, sources.ts)
- Message types (must match messages.ts)
- Component lists (must match editor/components/)
- Permissions and manifest config
- Dependencies and versions

## Style Rules

- Keep docs concise, no fluff
- Tables must be aligned (equal column spacing)
- ASCII diagrams must have consistent box widths
- Use existing format as reference
- No emojis unless already present
- English only

## Table Format Example

```md
| Column One | Column Two | Column Three |
|------------|------------|--------------|
| value      | value      | value        |
| longer val | short      | medium value |
```

## Diagram Alignment

- Box borders must align vertically
- Inner content must have consistent padding
- Use `─`, `│`, `┌`, `┐`, `└`, `┘`, `├`, `┤`, `┬`, `┴`, `┼` for borders

## Files to Check

- docs/overview.md
- docs/components/1-background.md
- docs/components/2-editor.md
- docs/components/3-floating-ui.md
- docs/components/4-storage.md
- docs/components/5-sources.md

## Final Step: Alignment Verification

After ALL content updates are done, run the `/docs:fix-docs-alignment` skill to detect and fix alignment issues in tables and ASCII diagrams.

## Output

After updates, list what changed in each file.
