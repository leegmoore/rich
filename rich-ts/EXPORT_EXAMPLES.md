# Rich Export Examples

This document demonstrates how to use the export functionality in Rich TypeScript.

## HTML Export

Export console output as HTML:

```typescript
import { Console, DEFAULT_TERMINAL_THEME } from 'rich-ts';

const console = new Console({ record: true });

console.print('[bold red]Hello[/bold red] [green]World[/green]!');
console.print('[cyan]This is a test[/cyan]');

const html = console.exportHtml({
  theme: DEFAULT_TERMINAL_THEME,
  inlineStyles: false, // Use CSS classes instead of inline styles
});

console.log(html);
```

## SVG Export

Export console output as SVG:

```typescript
import { Console, SVG_EXPORT_THEME } from 'rich-ts';

const console = new Console({ record: true });

console.print('[bold]Rich Console Output[/bold]');
console.print('[yellow]Colored text[/yellow]');

const svg = console.exportSvg({
  title: 'My Console Output',
  theme: SVG_EXPORT_THEME,
  fontAspectRatio: 0.61, // Fira Code aspect ratio
});

console.log(svg);
```

## Text Export

Export console output as plain text (with or without ANSI codes):

```typescript
import { Console } from 'rich-ts';

const console = new Console({ record: true });

console.print('[bold]Hello World[/bold]');

// Plain text (no ANSI codes)
const plainText = console.exportText({ clear: true, styles: false });
console.log(plainText); // "Hello World"

// With ANSI codes
const styledText = console.exportText({ clear: true, styles: true });
console.log(styledText); // "\x1b[1mHello World\x1b[0m"
```

## Notes

- Export methods require `record: true` in the Console constructor
- The `clear` option (default: `true`) clears the record buffer after exporting
- HTML export supports both inline styles and CSS classes
- SVG export uses Fira Code font by default (can be customized)

