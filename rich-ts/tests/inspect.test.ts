import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { inspect, Inspect } from '../src/inspect.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

const renderInspect = (obj: unknown, options?: Parameters<typeof inspect>[1]): string => {
  const console = new Console({
    width: 100,
    height: 40,
    force_terminal: true,
    colorSystem: 'truecolor',
  });
  console.beginCapture();
  console.print(inspect(obj, options));
  return console.endCapture();
};

describe('inspect', () => {
  it('inspects simple objects', () => {
    const obj = { name: 'Alice', age: 30 };
    const output = stripAnsi(renderInspect(obj));
    expect(output).toContain('name');
    expect(output).toContain('Alice');
    expect(output).toContain('age');
    expect(output).toContain('30');
  });

  it('inspects functions', () => {
    function testFunc(x: number, y: string): boolean {
      return true;
    }
    const output = stripAnsi(renderInspect(testFunc, { methods: true }));
    expect(output).toContain('function');
    expect(output).toContain('testFunc');
  });

  it('inspects arrays', () => {
    const arr = [1, 2, 3];
    const output = stripAnsi(renderInspect(arr));
    expect(output).toContain('1');
    expect(output).toContain('2');
    expect(output).toContain('3');
  });

  it('hides private attributes by default', () => {
    const obj = {
      public: 'visible',
      _private: 'hidden',
    };
    const output = stripAnsi(renderInspect(obj));
    expect(output).toContain('public');
    // The value section shows the full object, but the attributes table should be filtered
    // Check that _private is not in the attributes table (after the value section)
    const valueEnd = output.indexOf('└');
    const attributesSection = output.substring(valueEnd);
    expect(attributesSection).not.toContain('_private');
  });

  it('shows private attributes when requested', () => {
    const obj = {
      public: 'visible',
      _private: 'visible',
    };
    const output = stripAnsi(renderInspect(obj, { private: true }));
    expect(output).toContain('public');
    expect(output).toContain('_private');
  });

  it('hides dunder attributes by default', () => {
    const obj = {
      normal: 'visible',
      __dunder: 'hidden',
    };
    const output = stripAnsi(renderInspect(obj));
    expect(output).toContain('normal');
    // The value section shows the full object, but the attributes table should be filtered
    // Check that __dunder is not in the attributes table (after the value section)
    const valueEnd = output.indexOf('└');
    const attributesSection = output.substring(valueEnd);
    expect(attributesSection).not.toContain('__dunder');
  });

  it('shows dunder attributes when requested', () => {
    const obj = {
      normal: 'visible',
      __dunder: 'visible',
    };
    const output = stripAnsi(renderInspect(obj, { dunder: true }));
    expect(output).toContain('normal');
    expect(output).toContain('__dunder');
  });

  it('can disable sorting', () => {
    const obj = {
      zebra: 'z',
      apple: 'a',
    };
    const output1 = stripAnsi(renderInspect(obj, { sort: true }));
    const output2 = stripAnsi(renderInspect(obj, { sort: false }));
    // Outputs should be different
    expect(output1).not.toEqual(output2);
  });

  it('can customize title', () => {
    const obj = { x: 1 };
    const output = stripAnsi(renderInspect(obj, { title: 'Custom Title' }));
    expect(output).toContain('Custom Title');
  });

  it('inspects class instances', () => {
    class TestClass {
      public prop = 'value';
      private _private = 'hidden';
    }
    const instance = new TestClass();
    const output = stripAnsi(renderInspect(instance));
    expect(output).toContain('TestClass');
    expect(output).toContain('prop');
    expect(output).toContain('value');
  });

  it('returns Inspect instance', () => {
    const result = inspect({ x: 1 });
    expect(result).toBeInstanceOf(Inspect);
  });
});

