import { describe, expect, it, vi } from 'vitest';
import { Console } from '../src/console.js';
import { report } from '../src/diagnose.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

describe('diagnose', () => {
  it('report() prints diagnostic information', () => {
    const console = new Console({
      width: 100,
      height: 40,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    report();
    const output = console.endCapture();
    const stripped = stripAnsi(output);

    // Should contain diagnostic table headers
    expect(stripped).toContain('Rich Diagnostics');
    expect(stripped).toContain('Property');
    expect(stripped).toContain('Value');

    // Should contain platform information
    expect(stripped).toContain('Platform');
    expect(stripped).toContain('Terminal');
    expect(stripped).toContain('Color System');
    expect(stripped).toContain('Width');
    expect(stripped).toContain('Height');
  });

  it('report() includes terminal information', () => {
    const console = new Console({
      width: 100,
      height: 40,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    report();
    const output = console.endCapture();
    const stripped = stripAnsi(output);

    // Should show terminal status
    expect(stripped).toMatch(/Terminal\s+(Yes|No)/);
    expect(stripped).toMatch(/Color System\s+\w+/);
  });

  it('report() includes console dimensions', () => {
    const console = new Console({
      width: 120,
      height: 50,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    report();
    const output = console.endCapture();
    const stripped = stripAnsi(output);

    // Should show width and height
    expect(stripped).toContain('Width');
    expect(stripped).toContain('Height');
    expect(stripped).toContain('120');
    expect(stripped).toContain('50');
  });
});

