# Fix Docs Alignment

Detect and fix alignment issues in documentation files (tables and ASCII diagrams).

## Instructions

1. Run the validation script:

```bash
python3 .claude/commands/docs/fix-docs-alignment.py
```

2. If errors are found, read each reported file and fix the specific lines mentioned.

3. After fixing, re-run the script to verify. Repeat until clean.

## Fix Rules

### Tables

Every cell in a column MUST have the same width as the separator row.

If a cell is wider than the separator, widen the separator AND pad all other cells.
If a cell is narrower, add trailing spaces to match.

### ASCII Diagrams

Every line inside a box (between `┌─┐` and `└─┘`) MUST have the same total character length.

If a line is too short, add trailing spaces before the closing `│`.
If a line is too long, remove trailing spaces or shorten content.

### Inner Box Alignment

When boxes are nested or side-by-side, inner box borders (`┌┐└┘`) and content borders (`│`) MUST align at the same column.

If `┌───┐` ends at col N, every `│` and `└───┘` in that box must also end at col N.

### Wide Characters

NEVER use emojis or wide Unicode chars (e.g., `🛡`, `▶`) inside ASCII diagrams. They take 2 visual cells but count as 1 character, breaking all alignment. Use ASCII equivalents instead.

## Optional: Check Specific Files

Pass file paths as arguments to check only those files:

```bash
python3 .claude/commands/docs/fix-docs-alignment.py docs/overview.md docs/components/1-background.md
```
