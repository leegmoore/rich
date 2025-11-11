# Rich Comparison CLIs

This directory contains two CLI demo scripts that showcase Python Rich vs TypeScript Rich side-by-side for visual comparison.

## Purpose

These demos help verify that the TypeScript port matches Python Rich behavior by running identical examples and comparing the output visually.

## Structure

```
python-cli/
  ├── demo.py          # Python Rich demo with 12 examples
  └── requirements.txt # Python dependencies

typescript-cli/
  ├── demo.ts          # TypeScript Rich demo with 12 examples
  ├── package.json     # Node.js dependencies
  └── tsconfig.json    # TypeScript configuration
```

## Running the Demos

### Python CLI

```bash
# Install dependencies
cd python-cli
pip install -r requirements.txt

# Run the demo
python demo.py
```

Or make it executable and run directly:
```bash
chmod +x python-cli/demo.py
python-cli/demo.py
```

### TypeScript CLI

```bash
# Install dependencies
cd typescript-cli
npm install

# Run the demo
npm run demo
```

Or use tsx directly:
```bash
npx tsx typescript-cli/demo.ts
```

## Side-by-Side Comparison

To compare both outputs visually:

1. **Split Terminal Method:**
   - Open two terminal windows side-by-side
   - Run Python demo in one: `python python-cli/demo.py`
   - Run TypeScript demo in the other: `cd typescript-cli && npm run demo`
   - Compare the output visually

2. **Redirect to Files:**
   ```bash
   python python-cli/demo.py > python_output.txt
   cd typescript-cli && npm run demo > ../typescript_output.txt
   diff python_output.txt typescript_output.txt
   ```

## Examples Included

Both demos include 12 identical examples:

1. **Basic Text & Styles** - Bold, italic, colors, links
2. **Tables** - Formatted table with columns and rows
3. **Panels** - Bordered panels with titles
4. **Columns Layout** - Multi-column text layout
5. **Rules** - Horizontal rules/lines
6. **Alignment** - Left, center, right alignment
7. **Tree** - Hierarchical tree structure
8. **Syntax Highlighting** - Code syntax highlighting
9. **Markdown** - Markdown rendering
10. **Progress Bar** - Animated progress bar
11. **JSON** - Pretty-printed JSON
12. **Pretty Print** - Pretty-printed objects

## Expected Differences

Minor differences may occur due to:

- **Terminal capabilities** - Color support, Unicode rendering
- **Platform differences** - Windows vs Unix terminal behavior
- **Timing** - Progress bar animations may vary slightly
- **Font rendering** - Box drawing characters may render differently

However, the **structure, colors, and layout** should match closely.

## Troubleshooting

### Python Issues

- **Module not found**: Ensure `rich` is installed: `pip install -r python-cli/requirements.txt`
- **Python version**: Requires Python 3.7+

### TypeScript Issues

- **Module not found**: Run `npm install` in `typescript-cli/`
- **tsx not found**: Install globally: `npm install -g tsx` or use `npx tsx`
- **Import errors**: Ensure you're running from the repo root or adjust import paths

## Notes

- Both scripts use identical content and parameters
- The TypeScript version uses explicit imports (e.g., `Text.fromMarkup()` vs Python's automatic markup parsing)
- Progress bar uses async/await in TypeScript vs context manager in Python
- Some API differences exist but produce equivalent output

## Contributing

If you notice visual differences between the outputs, please:

1. Document the difference
2. Check if it's a known limitation
3. File an issue with screenshots/comparisons
4. Consider contributing a fix if it's a bug

