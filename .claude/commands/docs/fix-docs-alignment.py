#!/usr/bin/env python3
import sys
import os
import unicodedata

def visual_width(s):
    w = 0
    for c in s:
        cat = unicodedata.east_asian_width(c)
        if cat in ('W', 'F'):
            w += 2
        elif ord(c) > 0xFFFF:
            w += 2
        else:
            w += 1
    return w

def check_tables(fname, lines):
    errors = []
    sep_widths = None
    sep_line = None
    for i, line in enumerate(lines):
        raw = line.rstrip('\n')
        if raw.startswith('|') and raw.endswith('|'):
            cells = raw.split('|')
            widths = [len(c) for c in cells[1:-1]]
            if all(c.strip().replace('-', '') == '' for c in cells[1:-1]):
                sep_widths = widths
                sep_line = i + 1
            elif sep_widths:
                for ci, (w, ew) in enumerate(zip(widths, sep_widths)):
                    if w != ew:
                        errors.append(
                            f"L{i+1} table col{ci}: width={w} expected={ew} "
                            f"(separator at L{sep_line})"
                        )
        else:
            sep_widths = None
    return errors

def check_diagrams(fname, lines):
    errors = []
    in_code = False
    code_start = 0
    code_lines = []

    for i, line in enumerate(lines):
        raw = line.rstrip('\n')
        if raw.strip().startswith('```'):
            if in_code:
                errors.extend(_check_code_block(fname, code_lines))
                code_lines = []
            in_code = not in_code
            code_start = i
            continue
        if in_code:
            code_lines.append((i, raw))

    return errors

def _check_code_block(fname, code_lines):
    errors = []
    box_stack = {}

    for i, raw in code_lines:
        has_tree = '├──' in raw and '│' in raw and '┌' not in raw and '└' not in raw
        if has_tree and raw.strip().startswith('├') or raw.strip().startswith('│') and '/' in raw:
            continue

        top_positions = []
        for j, c in enumerate(raw):
            if c == '┌':
                end = raw.find('┐', j)
                if end != -1:
                    width = end - j + 1
                    box_stack[j] = {'width': width, 'top_line': i + 1, 'end_col': end}
                    top_positions.append((j, end, width))
            elif c == '├':
                end = raw.find('┤', j)
                if end != -1:
                    width = end - j + 1
                    box_stack[j] = {'width': width, 'top_line': i + 1, 'end_col': end}

        for start_col, box in list(box_stack.items()):
            expected_end = start_col + box['width'] - 1

            for j, c in enumerate(raw):
                if c == '│' and j == start_col:
                    last_pipe = None
                    for k in range(len(raw) - 1, j, -1):
                        if raw[k] == '│' and k > start_col:
                            candidate_end = k
                            if start_col in box_stack:
                                if candidate_end == expected_end:
                                    break
                                inner_boxes = [
                                    s for s in box_stack
                                    if s > start_col and s < candidate_end
                                ]
                                if not inner_boxes and candidate_end != expected_end:
                                    if abs(candidate_end - expected_end) <= 2:
                                        errors.append(
                                            f"L{i+1} box(col {start_col}): "
                                            f"right border at col {candidate_end}, "
                                            f"expected col {expected_end} "
                                            f"(box opened at L{box['top_line']})"
                                        )
                                break

                if c == '└' and j == start_col:
                    end = raw.find('┘', j)
                    if end != -1:
                        actual_width = end - j + 1
                        if actual_width != box['width']:
                            errors.append(
                                f"L{i+1} box(col {start_col}): "
                                f"bottom width={actual_width}, "
                                f"expected={box['width']} "
                                f"(top at L{box['top_line']})"
                            )
                    if j in box_stack:
                        del box_stack[j]

    return errors

def check_line_widths_in_boxes(fname, lines):
    errors = []
    in_code = False
    code_lines = []

    for i, line in enumerate(lines):
        raw = line.rstrip('\n')
        if raw.strip().startswith('```'):
            if in_code:
                errors.extend(_check_widths(code_lines))
                code_lines = []
            in_code = not in_code
            continue
        if in_code:
            code_lines.append((i, raw))

    return errors

def _check_widths(code_lines):
    errors = []
    is_tree = any('├──' in raw and '/' in raw for _, raw in code_lines)
    if is_tree:
        return errors

    BOX_CHARS = set('│┌└├┐┘┤┬┴')

    groups = []
    current = []
    for i, raw in code_lines:
        has_box = any(c in BOX_CHARS for c in raw)
        if has_box:
            current.append((i, raw))
        else:
            if current:
                groups.append(current)
                current = []
    if current:
        groups.append(current)

    for group in groups:
        by_start = {}
        for i, raw in group:
            box_positions = [j for j, c in enumerate(raw) if c in BOX_CHARS]
            if len(box_positions) < 2:
                continue
            first = box_positions[0]
            by_start.setdefault(first, []).append((i, raw))

        for start, lines in by_start.items():
            lengths = {}
            for i, raw in lines:
                lengths.setdefault(len(raw), []).append(i + 1)

            if len(lengths) > 1:
                most_common = max(lengths.keys(), key=lambda k: len(lengths[k]))
                for length, line_nums in lengths.items():
                    if length != most_common:
                        for ln in line_nums:
                            errors.append(
                                f"L{ln} width={length}, expected={most_common} "
                                f"(box group starting at col {start})"
                            )

    return errors

def main():
    docs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'docs')
    docs_dir = os.path.normpath(docs_dir)

    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        files = []
        for root, dirs, filenames in os.walk(docs_dir):
            for fn in sorted(filenames):
                if fn.endswith('.md'):
                    files.append(os.path.join(root, fn))

    total_errors = 0

    for fpath in sorted(files):
        with open(fpath) as f:
            lines = f.readlines()

        rel = os.path.relpath(fpath)
        errs = []
        errs.extend(check_tables(rel, lines))
        errs.extend(check_line_widths_in_boxes(rel, lines))

        if errs:
            print(f"\n{rel}:")
            for e in errs:
                print(f"  {e}")
            total_errors += len(errs)

    if total_errors == 0:
        print("ALL DOCS ALIGNED - no errors found")
    else:
        print(f"\n{total_errors} error(s) found")
        sys.exit(1)

if __name__ == '__main__':
    main()
