import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Console } from '../src/console.js';
import { Syntax, SyntaxHighlightRange } from '../src/syntax.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
// eslint-disable-next-line no-control-regex
const OSC_ESCAPE = /\x1B\][^\x1B]*\x1B\\/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '').replace(OSC_ESCAPE, '');

const render = (syntax: Syntax, width = 60): string => {
  const console = new Console({
    width,
    height: 40,
    force_terminal: true,
    colorSystem: 'truecolor',
    legacy_windows: false,
  });
  console.beginCapture();
  console.print(syntax);
  const output = console.endCapture();
  return output;
};

describe('Syntax', () => {
  it('renders blank lines with line numbers', () => {
    const code = '\n\nimport this\n\n';
    const syntax = new Syntax(code, 'python', {
      lineNumbers: true,
      codeWidth: 30,
      wordWrap: true,
    });
    const result = stripAnsi(render(syntax));
    expect(result).toContain('  1 ');
    expect(result).toContain('  3 import this');
    const blankLines = result.split('\n').filter((line) => line.trim() === '');
    expect(blankLines.length).toBeGreaterThan(0);
  });

  it('respects word wrap disabled setting', () => {
    const syntax = new Syntax('a = "long line that should stay together"', 'python', {
      wordWrap: false,
      codeWidth: 80,
    });
    const result = stripAnsi(render(syntax));
    expect(result.split('\n')[0] ?? '').toContain('long line');
  });

  it('supports padding', () => {
    const syntax = new Syntax('x = 1', 'python', {
      padding: [1, 2],
      backgroundColor: 'red',
    });
    const output = render(syntax, 20);
    const rows = stripAnsi(output).split('\n');
    expect(rows[0]).toMatch(/^\s+$/);
    expect(rows.some((line) => line.includes('x = 1'))).toBe(true);
  });

  it('reports measurement including line numbers', () => {
    const syntax = new Syntax('hello\nworld', 'python', { lineNumbers: true });
    const console = new Console({ width: 80, height: 25 });
    const measurement = syntax.__richMeasure__(console, console.options);
    expect(measurement.minimum).toBeGreaterThan(0);
    expect(measurement.maximum).toBeGreaterThan(measurement.minimum);
  });

  it('reads code from disk via fromPath', () => {
    const dir = mkdtempSync(join(tmpdir(), 'syntax-test-'));
    const file = join(dir, 'example.py');
    writeFileSync(file, 'print("hi")\n');
    const syntax = Syntax.fromPath(file);
    expect(syntax.code).toBe('print("hi")\n');
  });

  it('guesses lexer from filename and content', () => {
    expect(Syntax.guessLexer('example.py')).toBe('python');
    expect(Syntax.guessLexer('view.html', '<div></div>')).toBe('html');
  });

  it('applies highlight ranges to inline text', () => {
    const syntax = new Syntax('alpha\nbeta\ngamma', 'python');
    syntax.addHighlightRange(new SyntaxHighlightRange({ bold: true }, [2, 0], [2, 4]));
    const highlighted = syntax.highlight('alpha\nbeta\ngamma');
    const spans = highlighted.spans.filter((span) => span.style);
    expect(spans.some((span) => span.start === 6 && span.end === 10)).toBe(true);
  });

  it('applies line ranges exactly once', () => {
    const syntax = new Syntax('line1\nline2\nline3\nline4\n', 'python', {
      lineNumbers: true,
      lineRange: [2, 3],
    });
    const output = stripAnsi(render(syntax));
    expect(output).toContain('line2');
    expect(output).toContain('line3');
    expect(output).not.toContain('line1');
    expect(output).not.toContain('line4');
  });

  it('renders indent guides when enabled', () => {
    const code = 'if True:\n    print("hi")\n    if foo:\n        bar()\n';
    const syntax = new Syntax(code, 'python', { indentGuides: true });
    const output = stripAnsi(render(syntax));
    expect(output).toContain('│   print("hi")');
    expect(output).toContain('│   │   bar()');
  });
});
