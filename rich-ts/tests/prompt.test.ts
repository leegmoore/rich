import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Prompt, Confirm, IntPrompt, FloatPrompt } from '../src/prompt.js';

class StringInputStream {
  private index = 0;

  constructor(private readonly lines: string[]) {}

  readLine(): string | null {
    if (this.index >= this.lines.length) {
      return '';
    }
    const value = this.lines[this.index] ?? '';
    this.index += 1;
    return value;
  }
}

const createInputStream = (raw: string): StringInputStream => {
  const normalized = raw.endsWith('\n') ? `${raw}` : raw;
  const split = normalized.split('\n');
  return new StringInputStream(split);
};

const createConsole = (): Console =>
  new Console({
    width: 80,
    force_terminal: true,
    legacy_windows: false,
    colorSystem: null,
  });

describe('Prompt.ask', () => {
  it('validates choices and retries until valid input', () => {
    const console = createConsole();
    const stream = createInputStream('egg\nfoo');
    console.beginCapture();
    const name = Prompt.ask('what is your name', {
      console,
      choices: ['foo', 'bar'],
      default: 'baz',
      stream,
    });
    expect(name).toBe('foo');
    const output = console.endCapture();
    expect(output).toBe(
      'what is your name [foo/bar] (baz): Please select one of the available options\nwhat is your name [foo/bar] (baz): '
    );
  });

  it('respects case insensitive choice matching', () => {
    const console = createConsole();
    const stream = createInputStream('egg\nFoO');
    console.beginCapture();
    const name = Prompt.ask('what is your name', {
      console,
      choices: ['foo', 'bar'],
      default: 'baz',
      caseSensitive: false,
      stream,
    });
    expect(name).toBe('foo');
    const output = console.endCapture();
    expect(output).toBe(
      'what is your name [foo/bar] (baz): Please select one of the available options\nwhat is your name [foo/bar] (baz): '
    );
  });

  it('returns default when user accepts prompt', () => {
    const console = createConsole();
    const stream = createInputStream('');
    console.beginCapture();
    const name = Prompt.ask('what is your name', {
      console,
      default: 'Will',
      stream,
    });
    expect(name).toBe('Will');
    const output = console.endCapture();
    expect(output).toBe('what is your name (Will): ');
  });
});

describe('IntPrompt', () => {
  it('validates integer values', () => {
    const console = createConsole();
    const stream = createInputStream('foo\n100');
    console.beginCapture();
    const number = IntPrompt.ask('Enter a number', { console, stream });
    expect(number).toBe(100);
    const output = console.endCapture();
    expect(output).toBe('Enter a number: Please enter a valid integer number\nEnter a number: ');
  });
});

describe('FloatPrompt', () => {
  it('validates float values', () => {
    const console = createConsole();
    const stream = createInputStream('egg\n1.25');
    console.beginCapture();
    const value = FloatPrompt.ask('Enter a float', { console, stream });
    expect(value).toBeCloseTo(1.25);
    const output = console.endCapture();
    expect(output).toBe('Enter a float: Please enter a number\nEnter a float: ');
  });
});

describe('Confirm', () => {
  it('validates yes no responses', () => {
    const console = createConsole();
    const stream = createInputStream('foo\nNO\nn');
    console.beginCapture();
    const answer = Confirm.ask('continue', { console, stream });
    expect(answer).toBe(false);
    const output = console.endCapture();
    expect(output).toBe(
      'continue [y/n]: Please enter Y or N\ncontinue [y/n]: Please enter Y or N\ncontinue [y/n]: '
    );
  });

  it('accepts yes responses', () => {
    const console = createConsole();
    const stream = createInputStream('foo\nNO\ny');
    console.beginCapture();
    const answer = Confirm.ask('continue', { console, stream });
    expect(answer).toBe(true);
    const output = console.endCapture();
    expect(output).toBe(
      'continue [y/n]: Please enter Y or N\ncontinue [y/n]: Please enter Y or N\ncontinue [y/n]: '
    );
  });

  it('shows default choice in prompt', () => {
    const console = createConsole();
    const stream = createInputStream('foo\nNO\ny');
    console.beginCapture();
    const answer = Confirm.ask('continue', { console, stream, default: true });
    expect(answer).toBe(true);
    const output = console.endCapture();
    expect(output).toBe(
      'continue [y/n] (y): Please enter Y or N\ncontinue [y/n] (y): Please enter Y or N\ncontinue [y/n] (y): '
    );
  });
});
