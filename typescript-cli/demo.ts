#!/usr/bin/env node
/**
 * Rich TypeScript Demo - Ported Library
 * Run: npx tsx typescript-cli/demo.ts
 */
import { Console } from '../rich-ts/src/console';
import { Table } from '../rich-ts/src/table';
import { Panel } from '../rich-ts/src/panel';
import { Text } from '../rich-ts/src/text';
import { Columns } from '../rich-ts/src/columns';
import { Tree } from '../rich-ts/src/tree';
import { Syntax } from '../rich-ts/src/syntax';
import { Markdown } from '../rich-ts/src/markdown';
import { Progress } from '../rich-ts/src/progress';
import { JSON as RichJSON } from '../rich-ts/src/json';
import { Pretty } from '../rich-ts/src/pretty';
import { Align } from '../rich-ts/src/align';

const console = new Console();

async function main() {
  console.print("\n=== 1. BASIC TEXT & STYLES ===");
  console.print("Plain text");
  console.print(Text.fromMarkup("[bold]Bold text[/bold]"));
  console.print(Text.fromMarkup("[italic]Italic text[/italic]"));
  console.print(Text.fromMarkup("[bold red]Bold red text[/bold red]"));
  console.print(Text.fromMarkup("[yellow]Yellow[/yellow] and [green]Green[/green]"));
  console.print(Text.fromMarkup("[link=https://example.com]Clickable link[/link]"));

  console.print("\n=== 2. TABLES ===");
  const table = new Table({title: "Table Example"});
  table.addColumn("Name", {style: "cyan"});
  table.addColumn("Age", {style: "magenta"});
  table.addColumn("City", {style: "green"});
  table.addRow("Alice", "30", "NYC");
  table.addRow("Bob", "25", "LA");
  table.addRow("Carol", "35", "Chicago");
  console.print(table);

  console.print("\n=== 3. PANELS ===");
  const panel = new Panel("Panel content here", {title: "Panel Title", subtitle: "Subtitle"});
  console.print(panel);

  const panel2 = new Panel(Text.fromMarkup("[bold yellow]Styled content[/bold yellow]"), {title: "Styled Panel", border_style: "green"});
  console.print(panel2);

  console.print("\n=== 4. COLUMNS LAYOUT ===");
  const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];
  const columns = new Columns(items, {equal: true, expand: false});
  console.print(columns);

  console.print("\n=== 5. RULES ===");
  console.rule();
  console.rule("Section Title");
  console.rule(Text.fromMarkup("[bold red]Styled Rule[/bold red]"));

  console.print("\n=== 6. ALIGNMENT ===");
  console.print(Align.left("Left aligned"));
  console.print(Align.center("Center aligned"));
  console.print(Align.right("Right aligned"));

  console.print("\n=== 7. TREE ===");
  const tree = new Tree("Root");
  tree.add("Child 1");
  const branch = tree.add("Child 2");
  branch.add("Grandchild 1");
  branch.add("Grandchild 2");
  tree.add("Child 3");
  console.print(tree);

  console.print("\n=== 8. SYNTAX HIGHLIGHTING ===");
  const code = `
def hello(name):
    print(f"Hello, {name}!")
    return True
`;
  const syntax = new Syntax(code, "python", {theme: "monokai", line_numbers: true});
  console.print(syntax);

  console.print("\n=== 9. MARKDOWN ===");
  const markdown_text = `
# Heading 1
## Heading 2

This is **bold** and this is *italic*.

- Item 1
- Item 2
- Item 3

\`\`\`python
print("Code block")
\`\`\`
`;
  const markdown = new Markdown(markdown_text);
  console.print(markdown);

  console.print("\n=== 10. PROGRESS BAR ===");
  const progressInstance = new Progress();
  progressInstance.start();
  const task = progressInstance.addTask("Downloading...", { total: 100 });
  for (let i = 0; i < 100; i++) {
    progressInstance.update(task, { advance: 1 });
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  progressInstance.stop();
  console.print(Text.fromMarkup("[green]✓[/green] Progress complete"));

  console.print("\n=== 11. JSON ===");
  const data = {name: "Alice", age: 30, items: ["a", "b", "c"]};
  console.print(RichJSON.fromData(data));

  console.print("\n=== 12. PRETTY PRINT ===");
  const obj = {nested: {data: [1, 2, 3]}, key: "value"};
  console.print(new Pretty(obj));
}

main().catch(console.error);
