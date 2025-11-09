import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Rule } from '../src/rule.js';
import { Spinner } from '../src/spinner.js';
import { Measurement } from '../src/measure.js';
import { Text } from '../src/text.js';

const createConsole = (getTime: () => number, width = 80) =>
  new Console({
    width,
    force_terminal: true,
    legacy_windows: false,
    get_time: getTime,
  });

describe('Spinner', () => {
  it('creates a known spinner and rejects unknown names', () => {
    expect(() => new Spinner('dots')).not.toThrow();
    expect(() => new Spinner('not-real')).toThrow(/no spinner called/);
  });

  it('renders successive frames based on console time', () => {
    let currentTime = 0;
    const getTime = () => currentTime;
    const console = createConsole(getTime);
    console.beginCapture();
    const spinner = new Spinner('dots', 'Foo');
    console.print(spinner);
    currentTime += 0.08;
    console.print(spinner);
    const result = console.endCapture();
    expect(result).toBe('⠋ Foo\n⠙ Foo\n');
  });

  it('allows updates to text and speed mid-animation', () => {
    let currentTime = 0;
    const getTime = () => currentTime;
    const console = createConsole(getTime, 20);
    console.beginCapture();
    const spinner = new Spinner('dots');
    console.print(spinner);
    const rule = new Rule('Bar', { style: 'bright_green' });
    spinner.update({ text: rule });
    currentTime += 0.08;
    console.print(spinner);
    const result = console.endCapture();
    expect(result).toBe('⠋\n⠙ \x1b[92m─\x1b[0m\n');
  });

  it('measures the spinner width', () => {
    const console = new Console({ width: 80, colorSystem: null, force_terminal: true });
    const spinner = new Spinner('dots', 'Foo');
    const measurement = Measurement.get(console, console.options, spinner);
    expect(measurement.minimum).toBe(3);
    expect(measurement.maximum).toBe(5);
  });

  it('parses markup text arguments', () => {
    const spinner = new Spinner('dots', '[bold]spinning[/bold]');
    expect(spinner.text).toBeInstanceOf(Text);
    if (!(spinner.text instanceof Text)) {
      throw new Error('Spinner text should be a Text instance');
    }
    expect(spinner.text.toString()).toBe('spinning');
  });
});
