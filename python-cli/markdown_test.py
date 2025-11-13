#!/usr/bin/env python3
"""
Rich Python Markdown Test CLI
Reads and renders a markdown file
Run: python python-cli/markdown_test.py
"""
from rich.console import Console
from rich.markdown import Markdown
from pathlib import Path

console = Console()

def main():
    markdown_file_path = '/Users/leemoore/code/rich-port/rich/rich-ts/phases/COMPLETE_PORT_PLAN.md'
    
    try:
        console.print('[bold cyan]Reading markdown file:[/bold cyan]', markdown_file_path)
        console.print('')
        
        # Read the markdown file
        with open(markdown_file_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        # Render it with Rich
        markdown = Markdown(markdown_content)
        console.print(markdown)
        
        console.print('')
        console.print('[green]✓[/green] Markdown rendered successfully!')
    except FileNotFoundError:
        console.print(f'[red]✗[/red] File not found: {markdown_file_path}')
        exit(1)
    except Exception as error:
        console.print('[red]✗[/red] Error reading or rendering markdown:')
        console.print(f'[red]{error}[/red]')
        import traceback
        console.print(f'[dim]{traceback.format_exc()}[/dim]')
        exit(1)

if __name__ == '__main__':
    main()

