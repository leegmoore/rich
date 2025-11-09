import caseData from './data/highlighter_cases.json' assert { type: 'json' };
import { describe, expect, it } from 'vitest';

import {
  ISO8601Highlighter,
  JSONHighlighter,
  NullHighlighter,
  ReprHighlighter,
} from '../src/highlighter.js';
import { Span, Text } from '../src/text.js';

type CaseData = {
  repr: [string, Array<[number, number, string]>][];
  iso: [string, Array<[number, number, string]>][];
};

const data = caseData as CaseData;

const reprCases = data.repr.map(([text, spans]) => [
  text,
  spans.map(([start, end, style]) => new Span(start, end, style)),
]);

const isoCases = data.iso.map(([text, spans]) => [
  text,
  spans.map(([start, end, style]) => new Span(start, end, style)),
]);

describe('Highlighters', () => {
  it('raises on wrong type input', () => {
    const highlighter = new NullHighlighter();
    expect(() => highlighter.call([] as unknown as Text)).toThrow(TypeError);
  });

  it('call returns highlighted copy', () => {
    const highlighter = new ReprHighlighter();
    const result = highlighter.call('foo=bar');
    expect(result).toBeInstanceOf(Text);
    expect(result.spans.length).toBeGreaterThan(0);
  });

  it.each(reprCases)('repr highlight %s', (value, spans) => {
    const text = new Text(value);
    new ReprHighlighter().highlight(text);
    expect(text.spans).toEqual(spans);
  });

  it('highlights JSON with indent', () => {
    const jsonString = JSON.stringify({ name: 'apple', count: 1 }, null, 4);
    const text = new Text(jsonString);
    new JSONHighlighter().highlight(text);
    expect(text.spans).toEqual([
      new Span(0, 1, 'json.brace'),
      new Span(6, 12, 'json.str'),
      new Span(14, 21, 'json.str'),
      new Span(27, 34, 'json.str'),
      new Span(36, 37, 'json.number'),
      new Span(38, 39, 'json.brace'),
      new Span(6, 12, 'json.key'),
      new Span(27, 34, 'json.key'),
    ]);
  });

  it('highlights simple JSON string', () => {
    const text = new Text('"abc"');
    new JSONHighlighter().highlight(text);
    expect(text.spans).toEqual([new Span(0, 5, 'json.str')]);
  });

  it.each(isoCases)('iso8601 highlight %s', (value, spans) => {
    const text = new Text(value);
    new ISO8601Highlighter().highlight(text);
    expect(text.spans).toEqual(spans);
  });
});
