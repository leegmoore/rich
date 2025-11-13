#!/usr/bin/env node
/**
 * Rich TypeScript Markdown Test CLI
 * Reads and renders a markdown file
 * Run: npm run markdown-test
 */
import { Console } from '../rich-ts/src/console.js';
import { Markdown } from '../rich-ts/src/markdown.js';
import { readFileSync } from 'fs';

const console = new Console({
  force_terminal: true,
  highlight: true,
  markup: true,
});

async function main() {
  const markdownFilePath = '/Users/leemoore/code/rich-port/rich/rich-ts/phases/COMPLETE_PORT_PLAN.md';
  
  try {
    console.print('[bold cyan]Reading markdown file:[/bold cyan]', markdownFilePath);
    console.print('');
    
    // Read the markdown file
    const markdownContent = readFileSync(markdownFilePath, 'utf-8');
    
    // Render it with Rich
    const markdown = new Markdown(markdownContent);
    console.print(markdown);
    
    console.print('');
    console.print('[green]✓[/green] Markdown rendered successfully!');
  } catch (error) {
    console.print('[red]✗[/red] Error reading or rendering markdown:');
    console.print(`[red]${error instanceof Error ? error.message : String(error)}[/red]`);
    if (error instanceof Error && error.stack) {
      console.print(`[dim]${error.stack}[/dim]`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.print(`[red]Fatal error:[/red] ${error instanceof Error ? error.message : String(error)}`);
  if (error instanceof Error && error.stack) {
    console.print(`[dim]${error.stack}[/dim]`);
  }
  process.exit(1);
});

