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
import { RichJSON as JSON } from '../rich-ts/src/json.js';
import { Pretty } from '../rich-ts/src/pretty.js';
import { Align } from '../rich-ts/src/align.js';
import { Rule } from '../rich-ts/src/rule.js';

const console = new Console({
  force_terminal: true,
  highlight: true,
  markup: true,
});

async function main() {
  // 1. Basic Text & Styles
  console.print('\n=== 1. BASIC TEXT & STYLES ===');
  console.print('Plain text');
  console.print('[bold]Bold text[/bold]');
  console.print('[italic]Italic text[/italic]');
  console.print('[bold red]Bold red text[/bold red]');
  console.print('[yellow]Yellow[/yellow] and [green]Green[/green]');
  console.print('[link=https://example.com]Clickable link[/link]');

  // 2. Tables
  console.print('\n=== 2. TABLES ===');
  const table = new Table({ title: 'Table Example' });
  table.addColumn('Name', '', { style: 'cyan' });
  table.addColumn('Age', '', { style: 'magenta' });
  table.addColumn('City', '', { style: 'green' });
  table.addRow('Alice', '30', 'NYC');
  table.addRow('Bob', '25', 'LA');
  table.addRow('Carol', '35', 'Chicago');
  console.print(table);

  // 3. Panels
  console.print('\n=== 3. PANELS ===');
  const panel = new Panel('Panel content here', undefined, {
    title: 'Panel Title',
    subtitle: 'Subtitle',
  });
  console.print(panel);

  const panel2 = new Panel('[bold yellow]Styled content[/bold yellow]', undefined, {
    title: 'Styled Panel',
    borderStyle: 'green',
  });
  console.print(panel2);

  // 4. Columns Layout
  console.print('\n=== 4. COLUMNS LAYOUT ===');
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'];
  const columns = new Columns(items, [0, 1], { equal: true, expand: false });
  console.print(columns);

  // 5. Rules
  console.print('\n=== 5. RULES ===');
  console.print(new Rule());
  console.print(new Rule('Section Title'));
  console.print(new Rule('[bold red]Styled Rule[/bold red]'));

  // 6. Alignment
  console.print('\n=== 6. ALIGNMENT ===');
  console.print(Align.left('Left aligned'));
  console.print(Align.center('Center aligned'));
  console.print(Align.right('Right aligned'));

  // 7. Tree
  console.print('\n=== 7. TREE ===');
  const tree = new Tree('Root');
  tree.add('Child 1');
  const branch = tree.add('Child 2');
  branch.add('Grandchild 1');
  branch.add('Grandchild 2');
  tree.add('Child 3');
  console.print(tree);

  // 8. Syntax Highlighting
  console.print('\n=== 8. SYNTAX HIGHLIGHTING ===');
  const code = `def hello(name):
    print(f"Hello, {name}!")
    return True
`;
  const syntax = new Syntax(code, 'python', { theme: 'monokai', lineNumbers: true });
  console.print(syntax);

  // 9. Markdown
  console.print('\n=== 9. MARKDOWN ===');
  const markdownText = `
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
  const markdown = new Markdown(markdownText);
  console.print(markdown);

  // 10. Progress Bar (short demo)
  console.print('\n=== 10. PROGRESS BAR ===');
  try {
    const progress = new Progress({ console });
    const taskId = progress.addTask('Downloading...', { total: 100 });
    progress.start();
    for (let i = 0; i < 100; i++) {
      progress.update(taskId, { advance: 1, refresh: true });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    progress.stop();
    console.print('[green]✓[/green] Progress complete');
  } catch (error) {
    console.print(`[red]Progress error: ${error instanceof Error ? error.message : String(error)}[/red]`);
  }

  // 11. JSON
  console.print('\n=== 11. JSON ===');
  const data = { name: 'Alice', age: 30, items: ['a', 'b', 'c'] };
  console.print(JSON.fromData(data));

  // 12. Pretty Print
  console.print('\n=== 12. PRETTY PRINT ===');
  const obj = { nested: { data: [1, 2, 3] }, key: 'value' };
  console.print(new Pretty(obj));
}

main().catch((error) => {
  console.print(`[red]Error:[/red] ${error instanceof Error ? error.message : String(error)}`);
  if (error instanceof Error && error.stack) {
    console.print(`[dim]${error.stack}[/dim]`);
  }
  process.exit(1);
});

