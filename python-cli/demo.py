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
from rich.align import Align
from rich.json import JSON
from rich.pretty import Pretty
import time

console = Console()

console.print("\n=== 1. BASIC TEXT & STYLES ===")
console.print("Plain text")
console.print("[bold]Bold text[/bold]")
console.print("[italic]Italic text[/italic]")
console.print("[bold red]Bold red text[/bold red]")
console.print("[yellow]Yellow[/yellow] and [green]Green[/green]")
console.print("[link=https://example.com]Clickable link[/link]")

console.print("\n=== 2. TABLES ===")
table = Table(title="Table Example")
table.add_column("Name", style="cyan")
table.add_column("Age", style="magenta")
table.add_column("City", style="green")
table.add_row("Alice", "30", "NYC")
table.add_row("Bob", "25", "LA")
table.add_row("Carol", "35", "Chicago")
console.print(table)

console.print("\n=== 3. PANELS ===")
panel = Panel("Panel content here", title="Panel Title", subtitle="Subtitle")
console.print(panel)

panel2 = Panel("[bold yellow]Styled content[/bold yellow]", title="Styled Panel", border_style="green")
console.print(panel2)

console.print("\n=== 4. COLUMNS LAYOUT ===")
items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]
columns = Columns(items, equal=True, expand=False)
console.print(columns)

console.print("\n=== 5. RULES ===")
console.rule()
console.rule("Section Title")
console.rule("[bold red]Styled Rule[/bold red]")

console.print("\n=== 6. ALIGNMENT ===")
console.print(Align.left("Left aligned"))
console.print(Align.center("Center aligned"))
console.print(Align.right("Right aligned"))

console.print("\n=== 7. TREE ===")
tree = Tree("Root")
tree.add("Child 1")
branch = tree.add("Child 2")
branch.add("Grandchild 1")
branch.add("Grandchild 2")
tree.add("Child 3")
console.print(tree)

console.print("\n=== 8. SYNTAX HIGHLIGHTING ===")
code = '''
def hello(name):
    print(f"Hello, {name}!")
    return True
'''
syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
console.print(syntax)

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

console.print("\n=== 10. PROGRESS BAR ===")
with Progress() as progress:
    task = progress.add_task("Downloading...", total=100)
    for i in range(100):
        progress.update(task, advance=1)
        time.sleep(0.01)
console.print("[green]✓[/green] Progress complete")

console.print("\n=== 11. JSON ===")
data = {"name": "Alice", "age": 30, "items": ["a", "b", "c"]}
console.print(JSON.from_data(data))

console.print("\n=== 12. PRETTY PRINT ===")
obj = {"nested": {"data": [1, 2, 3]}, "key": "value"}
console.print(Pretty(obj))
