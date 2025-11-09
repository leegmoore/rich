import { describe, expect, it } from 'vitest';

import { Console } from '../src/console.js';
import { Lines, Renderables } from '../src/containers.js';
import { Measurement } from '../src/measure.js';
import { Text } from '../src/text.js';

describe('Renderables', () => {
  it('measures contained renderables', () => {
    const console = new Console({ force_terminal: true });
    const text = new Text('foo');
    const renderables = new Renderables([text]);

    const measurement = renderables.__richMeasure__(console, console.options);
    expect(measurement).toEqual(new Measurement(3, 3));
    expect(Array.from(renderables)).toEqual([text]);
  });

  it('uses default measurement for empty lists', () => {
    const console = new Console({ force_terminal: true });
    const renderables = new Renderables();

    const measurement = renderables.__richMeasure__(console, console.options);
    expect(measurement).toEqual(new Measurement(1, 1));
  });
});

describe('Lines', () => {
  it('yields lines via __richConsole__', () => {
    const console = new Console({ force_terminal: true });
    const line = new Text('foo');
    const lines = new Lines([line]);

    const rendered = Array.from(lines.__richConsole__(console, console.options));
    expect(rendered).toEqual([line]);
  });

  it('justifies text in multiple modes', () => {
    const console = new Console({ force_terminal: true });
    const boldStyle = 'bold';
    const linesLeft = new Lines([new Text('foo', boldStyle), new Text('test', boldStyle)]);
    linesLeft.justify(console, 10, 'left');
    expect(linesLeft._lines.map((line) => line.plain)).toEqual(['foo       ', 'test      ']);

    linesLeft.justify(console, 10, 'center');
    expect(linesLeft._lines.map((line) => line.plain)).toEqual(['   foo    ', '   test   ']);

    linesLeft.justify(console, 10, 'right');
    expect(linesLeft._lines.map((line) => line.plain)).toEqual(['       foo', '      test']);

    const linesFull = new Lines([new Text('foo bar', boldStyle), new Text('test', boldStyle)]);
    linesFull.justify(console, 7, 'full');

    expect(linesFull._lines[0].plain).toBe('foo bar');
    expect(linesFull._lines[1].plain).toBe('test');
  });
});
