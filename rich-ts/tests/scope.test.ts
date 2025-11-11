import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { renderScope } from '../src/scope.js';
import { Text } from '../src/text.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

const renderScopeOutput = (scope: Record<string, unknown>, options?: Parameters<typeof renderScope>[1]): string => {
  const console = new Console({
    width: 100,
    height: 40,
    force_terminal: true,
    colorSystem: 'truecolor',
  });
  console.beginCapture();
  console.print(renderScope(scope, options));
  return console.endCapture();
};

describe('renderScope', () => {
  it('renders simple scope variables', () => {
    const scope = {
      name: 'Alice',
      age: 30,
      active: true,
    };
    const output = stripAnsi(renderScopeOutput(scope));
    expect(output).toContain('name');
    expect(output).toContain('Alice');
    expect(output).toContain('age');
    expect(output).toContain('30');
    expect(output).toContain('active');
    expect(output).toContain('true');
  });

  it('renders scope with title', () => {
    const scope = { x: 1, y: 2 };
    const output = stripAnsi(renderScopeOutput(scope, { title: 'Variables' }));
    expect(output).toContain('Variables');
  });

  it('sorts keys by default', () => {
    const scope = {
      zebra: 'z',
      apple: 'a',
      banana: 'b',
    };
    const output = stripAnsi(renderScopeOutput(scope));
    const appleIndex = output.indexOf('apple');
    const bananaIndex = output.indexOf('banana');
    const zebraIndex = output.indexOf('zebra');
    expect(appleIndex).toBeLessThan(bananaIndex);
    expect(bananaIndex).toBeLessThan(zebraIndex);
  });

  it('can disable sorting', () => {
    const scope = {
      zebra: 'z',
      apple: 'a',
      banana: 'b',
    };
    const output1 = stripAnsi(renderScopeOutput(scope, { sortKeys: true }));
    const output2 = stripAnsi(renderScopeOutput(scope, { sortKeys: false }));
    // Outputs should be different when sorting is disabled
    expect(output1).not.toEqual(output2);
  });

  it('hides private variables by default', () => {
    const scope = {
      public: 'visible',
      _private: 'hidden',
      __dunder: 'hidden',
    };
    const output = stripAnsi(renderScopeOutput(scope));
    expect(output).toContain('public');
    expect(output).not.toContain('_private');
    expect(output).not.toContain('__dunder');
  });

  it('shows private variables when requested', () => {
    const scope = {
      public: 'visible',
      _private: 'visible',
    };
    const output = stripAnsi(renderScopeOutput(scope, { private: true }));
    expect(output).toContain('public');
    expect(output).toContain('_private');
  });

  it('shows dunder variables when requested', () => {
    const scope = {
      normal: 'visible',
      __dunder: 'visible',
    };
    const output = stripAnsi(renderScopeOutput(scope, { dunder: true }));
    expect(output).toContain('normal');
    expect(output).toContain('__dunder');
  });

  it('renders nested objects', () => {
    const scope = {
      user: {
        name: 'Alice',
        age: 30,
      },
    };
    const output = stripAnsi(renderScopeOutput(scope));
    expect(output).toContain('user');
    expect(output).toContain('name');
    expect(output).toContain('Alice');
  });

  it('renders arrays', () => {
    const scope = {
      items: [1, 2, 3],
    };
    const output = stripAnsi(renderScopeOutput(scope));
    expect(output).toContain('items');
    expect(output).toContain('1');
    expect(output).toContain('2');
    expect(output).toContain('3');
  });

  it('respects maxLength option', () => {
    const scope = {
      longArray: Array.from({ length: 20 }, (_, i) => i),
    };
    const output = stripAnsi(renderScopeOutput(scope, { maxLength: 5 }));
    expect(output).toContain('longArray');
    // Should be truncated
    expect(output).toMatch(/\.\.\./);
  });

  it('respects maxString option', () => {
    const scope = {
      longString: 'a'.repeat(100),
    };
    const output = stripAnsi(renderScopeOutput(scope, { maxString: 10 }));
    expect(output).toContain('longString');
    // Pretty may show it as 'aaa...' or 'aaa'+N format, just check it's not the full string
    expect(output).not.toContain('a'.repeat(100));
    // Should contain some indication of truncation (either ... or +N)
    expect(output).toMatch(/(\.\.\.|\+\d+)/);
  });
});

