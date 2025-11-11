import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Panel } from '../src/panel.js';
import { Text } from '../src/text.js';

const createConsole = (options: ConstructorParameters<typeof Console>[0] = {}) =>
  new Console({ force_terminal: false, legacy_windows: false, ...options });

const tests = [
  new Panel('Hello, World', undefined, { padding: 0 }),
  new Panel('Hello, World', undefined, { expand: false, padding: 0 }),
  Panel.fit('Hello, World', undefined, { padding: 0 }),
  new Panel('Hello, World', undefined, { width: 8, padding: 0 }),
  new Panel(new Panel('Hello, World', undefined, { padding: 0 }), undefined, { padding: 0 }),
  new Panel('Hello, World', undefined, { title: 'FOO', padding: 0 }),
  new Panel('Hello, World', undefined, { subtitle: 'FOO', padding: 0 }),
];

const expected = [
  '╭────────────────────────────────────────────────╮\n│Hello, World                                    │\n╰────────────────────────────────────────────────╯\n',
  '╭────────────╮\n│Hello, World│\n╰────────────╯\n',
  '╭────────────╮\n│Hello, World│\n╰────────────╯\n',
  '╭──────╮\n│Hello,│\n│World │\n╰──────╯\n',
  '╭────────────────────────────────────────────────╮\n│╭──────────────────────────────────────────────╮│\n││Hello, World                                  ││\n│╰──────────────────────────────────────────────╯│\n╰────────────────────────────────────────────────╯\n',
  '╭───────────────────── FOO ──────────────────────╮\n│Hello, World                                    │\n╰────────────────────────────────────────────────╯\n',
  '╭────────────────────────────────────────────────╮\n│Hello, World                                    │\n╰───────────────────── FOO ──────────────────────╯\n',
];

function render(panel: Panel, width = 50): string {
  const console = createConsole({ width });
  console.beginCapture();
  console.print(panel);
  return console.endCapture();
}

describe('Panel', () => {
  tests.forEach((panel, index) => {
    it(`test_render_panel[${index}]`, () => {
      const result = render(panel);
      expect(result).toBe(expected[index]);
    });
  });

  it('test_console_width', () => {
    const console = createConsole({ width: 50 });
    const panel = new Panel('Hello, World', undefined, { expand: false });
    const measurement = panel.__richMeasure__(console, console.options);
    expect(measurement.minimum).toBe(16);
    expect(measurement.maximum).toBe(16);
  });

  it('test_fixed_width', () => {
    const console = createConsole({ width: 50 });
    const panel = new Panel('Hello World', undefined, { width: 20 });
    const measurement = panel.__richMeasure__(console, console.options);
    expect(measurement.minimum).toBe(20);
    expect(measurement.maximum).toBe(20);
  });

  it('test_render_size', () => {
    const console = createConsole({ width: 63, height: 46 });
    const options = console.options.updateDimensions(80, 4);
    const lines = console.renderLines(new Panel('foo', undefined, { title: 'Hello' }), options);

    const plainRows = lines.map((line) => line.map((segment) => segment.text).join(''));
    const expected = [
      '╭─────────────────────────────────── Hello ────────────────────────────────────╮',
      '│ foo                                                                          │',
      '│                                                                              │',
      '╰──────────────────────────────────────────────────────────────────────────────╯',
    ];
    expect(plainRows).toEqual(expected);
  });

  it('test_title_text', () => {
    const panel = new Panel('Hello, World', undefined, {
      title: new Text('title', 'red'),
      subtitle: new Text('subtitle', 'magenta bold'),
    });
    const console = new Console({
      width: 50,
      height: 20,
      legacy_windows: false,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    console.print(panel);
    const result = console.endCapture();
    const expected =
      '╭────────────────────\x1b[31m title \x1b[0m─────────────────────╮\n│ Hello, World                                   │\n╰───────────────────\x1b[1;35m subtitle \x1b[0m───────────────────╯\n';
    expect(result).toBe(expected);
  });

  it('test_title_text_with_border_color', () => {
    const panel = new Panel('Hello, World', undefined, {
      borderStyle: 'blue',
      title: new Text('title', 'red'),
      subtitle: new Text('subtitle', 'magenta bold'),
    });
    const console = new Console({
      width: 50,
      height: 20,
      legacy_windows: false,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    console.print(panel);
    const result = console.endCapture();
    const expected =
      '\x1b[34m╭─\x1b[0m\x1b[34m───────────────────\x1b[0m\x1b[31m title \x1b[0m\x1b[34m────────────────────\x1b[0m\x1b[34m─╮\x1b[0m\n\x1b[34m│\x1b[0m Hello, World                                   \x1b[34m│\x1b[0m\n\x1b[34m╰─\x1b[0m\x1b[34m──────────────────\x1b[0m\x1b[1;35m subtitle \x1b[0m\x1b[34m──────────────────\x1b[0m\x1b[34m─╯\x1b[0m\n';
    expect(result).toBe(expected);
  });

  it('test_title_text_with_panel_background', () => {
    const panel = new Panel('Hello, World', undefined, {
      style: 'on blue',
      title: new Text('title', 'red'),
      subtitle: new Text('subtitle', 'magenta bold'),
    });
    const console = new Console({
      width: 50,
      height: 20,
      legacy_windows: false,
      force_terminal: true,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    console.print(panel);
    const result = console.endCapture();
    const expected =
      '\x1b[44m╭─\x1b[0m\x1b[44m───────────────────\x1b[0m\x1b[31;44m title \x1b[0m\x1b[44m────────────────────\x1b[0m\x1b[44m─╮\x1b[0m\n\x1b[44m│\x1b[0m\x1b[44m \x1b[0m\x1b[44mHello, World\x1b[0m\x1b[44m                                  \x1b[0m\x1b[44m \x1b[0m\x1b[44m│\x1b[0m\n\x1b[44m╰─\x1b[0m\x1b[44m──────────────────\x1b[0m\x1b[1;35;44m subtitle \x1b[0m\x1b[44m──────────────────\x1b[0m\x1b[44m─╯\x1b[0m\n';
    expect(result).toBe(expected);
  });
});
