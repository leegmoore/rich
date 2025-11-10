import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Markdown } from '../src/markdown.js';
import type { MarkdownOptions } from '../src/markdown.js';

const SAMPLE = `Heading
=======

An [example](http://example.com).

> Markdown uses email-style > characters for blockquoting.
>
> Lorem ipsum

* apples
* oranges

1. lather
2. rinse

\`\`\`python
import this
\`\`\`

![progress](https://example.com/progress.gif)
`;

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

const renderMarkdown = (markdown: string, options?: MarkdownOptions): string => {
  const console = new Console({
    width: 100,
    height: 40,
    force_terminal: true,
    colorSystem: 'truecolor',
  });
  console.beginCapture();
  console.print(new Markdown(markdown, options));
  return console.endCapture();
};

describe('Markdown', () => {
  it('renders headings and panel for h1', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE));
    expect(output).toContain('Heading');
    expect(output).toContain('┏');
  });

  it('renders bullet lists with markers', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE));
    expect(output).toContain(' • apples');
    expect(output).toContain(' • oranges');
  });

  it('renders ordered lists with numbers', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE));
    expect(output).toContain(' 1 lather');
    expect(output).toContain(' 2 rinse');
  });

  it('renders code blocks via Syntax', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE));
    expect(output).toContain('import this');
  });

  it('renders block quotes with prefix', () => {
    const output = renderMarkdown(SAMPLE);
    expect(output).toMatch(/▌ .*Markdown uses email-style/);
  });

  it('emits OSC hyperlinks when enabled', () => {
    const output = renderMarkdown(SAMPLE);
    expect(output).toMatch(/\x1b]8;[^;]*;http:\/\/example\.com\x1b\\/);
    expect(output).toMatch(/example[\s\S]*\x1b]8;;\x1b\\/);
  });

  it('falls back to visible URLs when hyperlinks disabled', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE, { hyperlinks: false }));
    expect(output).toContain('example (http://example.com)');
  });

  it('renders image placeholder', () => {
    const output = stripAnsi(renderMarkdown(SAMPLE));
    expect(output).toContain('🌆 progress');
  });

  it('renders nested list content without dropping children', () => {
    const markdown = `* parent
    * child

    \`\`\`
    nested()
    \`\`\`
`;
    const output = stripAnsi(renderMarkdown(markdown));
    expect(output).toContain(' • parent');
    expect(output).toContain('child');
    expect(output).toContain('nested()');
  });

  it('renders strikethrough spans when enabled', () => {
    const output = renderMarkdown('This has ~~strike~~ text.');
    expect(output).toMatch(/\x1b\[9mstrike\x1b\[0m/);
  });

  it('renders markdown tables instead of dropping them', () => {
    const markdown = `| Name | Value |\n| ---- | ----- |\n| foo | 1 |\n| bar | 2 |\n`;
    const output = stripAnsi(renderMarkdown(markdown));
    expect(output).toContain('Name');
    expect(output).toContain('Value');
    expect(output).toContain('foo');
    expect(output).toContain('bar');
  });
});
