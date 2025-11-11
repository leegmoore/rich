===== BUILD COMPARISON CLIs: PYTHON vs TYPESCRIPT RICH =====

**Task:** Build 2 CLI demo scripts showing Python Rich vs TypeScript Rich side-by-side  
**Goal:** Visual verification that TypeScript port matches Python behavior

---

## 🎯 YOUR MISSION

Create two CLI scripts that output identical Rich examples for visual comparison.

**Deliverables:**
1. `python-cli/demo.py` - Python Rich examples
2. `typescript-cli/demo.ts` - TypeScript Rich port examples
3. Both show same features in same order
4. User can run both and visually compare output

---

## 📋 WHAT TO BUILD

### Python CLI: `python-cli/demo.py`

**Location:** Create directory at repo root: `/Users/leemoore/code/rich-port/rich/python-cli/`

**Setup:**
```python
#!/usr/bin/env python3
"""
Rich Python Demo - Original Library
Run: python python-cli/demo.py
"""
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.columns import Columns
from rich.tree import Tree
from rich.syntax import Syntax
from rich.markdown import Markdown
from rich.progress import Progress
from rich import print as rprint
import time

console = Console()
```

**Examples to Include (in order):**

1. **Basic Text & Styles**
```python
console.print("\n=== 1. BASIC TEXT & STYLES ===")
console.print("Plain text")
console.print("[bold]Bold text[/bold]")
console.print("[italic]Italic text[/italic]")
console.print("[bold red]Bold red text[/bold red]")
console.print("[yellow]Yellow[/yellow] and [green]Green[/green]")
console.print("[link=https://example.com]Clickable link[/link]")
```

2. **Tables**
```python
console.print("\n=== 2. TABLES ===")
table = Table(title="Table Example")
table.add_column("Name", style="cyan")
table.add_column("Age", style="magenta")
table.add_column("City", style="green")
table.add_row("Alice", "30", "NYC")
table.add_row("Bob", "25", "LA")
table.add_row("Carol", "35", "Chicago")
console.print(table)
```

3. **Panels**
```python
console.print("\n=== 3. PANELS ===")
panel = Panel("Panel content here", title="Panel Title", subtitle="Subtitle")
console.print(panel)

panel2 = Panel("[bold yellow]Styled content[/bold yellow]", title="Styled Panel", border_style="green")
console.print(panel2)
```

4. **Columns Layout**
```python
console.print("\n=== 4. COLUMNS LAYOUT ===")
items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]
columns = Columns(items, equal=True, expand=False)
console.print(columns)
```

5. **Rules**
```python
console.print("\n=== 5. RULES ===")
console.rule()
console.rule("Section Title")
console.rule("[bold red]Styled Rule[/bold red]")
```

6. **Alignment**
```python
console.print("\n=== 6. ALIGNMENT ===")
from rich.align import Align
console.print(Align.left("Left aligned"))
console.print(Align.center("Center aligned"))
console.print(Align.right("Right aligned"))
```

7. **Tree**
```python
console.print("\n=== 7. TREE ===")
tree = Tree("Root")
tree.add("Child 1")
branch = tree.add("Child 2")
branch.add("Grandchild 1")
branch.add("Grandchild 2")
tree.add("Child 3")
console.print(tree)
```

8. **Syntax Highlighting**
```python
console.print("\n=== 8. SYNTAX HIGHLIGHTING ===")
code = '''
def hello(name):
    print(f"Hello, {name}!")
    return True
'''
syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
console.print(syntax)
```

9. **Markdown**
```python
console.print("\n=== 9. MARKDOWN ===")
markdown_text = """
# Heading 1
## Heading 2

This is **bold** and this is *italic*.

- Item 1
- Item 2
- Item 3

```python
print("Code block")
```
"""
markdown = Markdown(markdown_text)
console.print(markdown)
```

10. **Progress Bar** (short demo)
```python
console.print("\n=== 10. PROGRESS BAR ===")
with Progress() as progress:
    task = progress.add_task("Downloading...", total=100)
    for i in range(100):
        progress.update(task, advance=1)
        time.sleep(0.01)
console.print("[green]✓[/green] Progress complete")
```

11. **JSON**
```python
console.print("\n=== 11. JSON ===")
from rich.json import JSON
data = {"name": "Alice", "age": 30, "items": ["a", "b", "c"]}
console.print(JSON.from_data(data))
```

12. **Pretty Print**
```python
console.print("\n=== 12. PRETTY PRINT ===")
from rich.pretty import Pretty
obj = {"nested": {"data": [1, 2, 3]}, "key": "value"}
console.print(Pretty(obj))
```

**Save as:** `python-cli/demo.py`  
**Make executable:** `chmod +x python-cli/demo.py`

---

### TypeScript CLI: `typescript-cli/demo.ts`

**Location:** Create directory at repo root: `/Users/leemoore/code/rich-port/rich/typescript-cli/`

**Setup:**
```typescript
#!/usr/bin/env node
/**
 * Rich TypeScript Demo - Ported Library
 * Run: npx tsx typescript-cli/demo.ts
 */
import { Console } from '../rich-ts/src/console.js';
import { Table } from '../rich-ts/src/table.js';
import { Panel } from '../rich-ts/src/panel.js';
import { Text } from '../rich-ts/src/text.js';
import { Columns } from '../rich-ts/src/columns.js';
import { Tree } from '../rich-ts/src/tree.js';
import { Syntax } from '../rich-ts/src/syntax.js';
import { Markdown } from '../rich-ts/src/markdown.js';
import { Progress } from '../rich-ts/src/progress.js';
import { JSON as RichJSON } from '../rich-ts/src/json.js';
import { Pretty } from '../rich-ts/src/pretty.js';
import { Align } from '../rich-ts/src/align.js';

const console = new Console();

async function main() {
  // Port ALL 12 examples from Python version
  // Use identical text, same order, same parameters
  
  console.print("\n=== 1. BASIC TEXT & STYLES ===");
  console.print("Plain text");
  console.print(Text.fromMarkup("[bold]Bold text[/bold]"));
  // ... etc
  
  // Continue with all 12 examples
}

main().catch(console.error);
```

**Create package.json:**
```json
{
  "name": "typescript-cli",
  "type": "module",
  "scripts": {
    "demo": "tsx demo.ts"
  },
  "dependencies": {
    "tsx": "^4.0.0"
  }
}
```

**Run:** `npm install` then `npm run demo`

---

## 📝 IMPLEMENTATION DETAILS

### For Each Example (1-12):

**Port identically from Python to TypeScript:**
- Same text content
- Same parameters
- Same order
- Same visual structure

**Handle API differences:**
- Python: `Console.print("[bold]text[/bold]")` (markup auto-parsed)
- TypeScript: `Console.print(Text.fromMarkup("[bold]text[/bold]"))` (explicit)

**Module availability:**
- Skip any module not yet ported (note which ones)
- Or implement minimal version if needed for comparison

---

## 🎨 OUTPUT FORMAT

**Both CLIs should:**
1. Print section headers (=== 1. FEATURE ===)
2. Output the demo for that feature
3. Add spacing between sections
4. Use identical content/parameters

**Result:**
```bash
# Terminal 1 - Python
python python-cli/demo.py

# Terminal 2 - TypeScript  
cd typescript-cli && npm run demo

# Should look nearly identical!
```

---

## 📦 DELIVERABLES

### Files to Create:

1. `python-cli/demo.py` - Python Rich demo
2. `python-cli/requirements.txt`:
   ```
   rich>=13.0.0
   ```

3. `typescript-cli/demo.ts` - TypeScript Rich demo
4. `typescript-cli/package.json` - With tsx dependency
5. `typescript-cli/tsconfig.json` - TypeScript config:
   ```json
   {
     "extends": "../rich-ts/tsconfig.json",
     "compilerOptions": {
       "module": "ESNext",
       "moduleResolution": "bundler"
     }
   }
   ```

6. `COMPARISON_CLI_README.md` - How to run both:
   ```markdown
   # Rich Comparison CLIs
   
   ## Python CLI
   ```bash
   cd python-cli
   pip install -r requirements.txt
   python demo.py
   ```
   
   ## TypeScript CLI
   ```bash
   cd typescript-cli
   npm install
   npm run demo
   ```
   
   ## Side-by-Side
   Run both in split terminal to compare output!
   ```

---

## ✅ SUCCESS CRITERIA

- [ ] Python CLI runs and shows all 12 examples
- [ ] TypeScript CLI runs and shows all 12 examples  
- [ ] Output is visually similar (accounting for minor differences)
- [ ] Both CLIs in separate directories (python-cli/, typescript-cli/)
- [ ] README explains how to run both
- [ ] Can identify any visual differences between Python and TypeScript versions

---

## ⚠️ NOTES

**Modules not yet ported:**
- If any module from examples isn't ported, note it and skip that example
- Or implement minimal version just for demo

**Expected differences:**
- Minor: spacing, exact ANSI codes may vary slightly
- Box drawing characters should match
- Colors should match
- Layout should match

**Purpose:**
- Visual verification of port quality
- Easy way to spot differences
- Demonstrates core features working
- Useful for showcasing the port

---

## 🚀 START BUILDING

1. Create python-cli/ directory with demo.py
2. Create typescript-cli/ directory with demo.ts
3. Port all 12 examples
4. Test both work
5. Create README
6. Commit both CLIs

**Timeline:** 2-3 hours

**GO!** 🎨

