import {
  Console,
  type ConsoleOptions,
  type RenderResult,
  type JustifyMethod,
  type OverflowMethod,
  type ConsoleRenderable,
} from './console.js';
import { Text } from './text.js';
import { Measurement } from './measure.js';
import { cellLen } from './cells.js';
import { ReprHighlighter, type Highlighter } from './highlighter.js';
import type { Result as RichReprResult } from './repr.js';

const DEFAULT_MAX_WIDTH = 80;
const QUOTE = "'";

export interface PrettyReprOptions {
  maxWidth?: number;
  indentSize?: number;
  maxDepth?: number | null;
  maxLength?: number | null;
  maxString?: number | null;
  expandAll?: boolean;
}

export interface PrettyRenderOptions extends PrettyReprOptions {
  highlighter?: Highlighter;
  justify?: JustifyMethod | null;
  overflow?: OverflowMethod | null;
  noWrap?: boolean;
  indentGuides?: boolean;
  margin?: number;
  insertLine?: boolean;
}

export interface PPrintOptions extends PrettyRenderOptions {
  console?: Console;
}

interface NormalizedOptions {
  maxWidth: number;
  indentSize: number;
  maxDepth: number | null;
  maxLength: number | null;
  maxString: number | null;
  expandAll: boolean;
}

interface FormatContext {
  options: NormalizedOptions;
  seen: WeakSet<object>;
}

const DEFAULT_OPTIONS: NormalizedOptions = {
  maxWidth: DEFAULT_MAX_WIDTH,
  indentSize: 4,
  maxDepth: null,
  maxLength: null,
  maxString: null,
  expandAll: false,
};

export class Node {
  key: string;
  value: string;
  separator: string;

  constructor(key: string = '', value: string = '', options: { separator?: string } = {}) {
    this.key = key;
    this.value = value;
    this.separator = options.separator ?? ': ';
  }

  toString(): string {
    return this.key ? `${this.key}${this.separator}${this.value}` : this.value;
  }
}

export class Pretty {
  private readonly value: unknown;
  private readonly highlighter: Highlighter;
  private readonly indentSize: number;
  private readonly justify?: JustifyMethod | null;
  private readonly overflow?: OverflowMethod | null;
  private readonly noWrap?: boolean;
  private readonly indentGuides: boolean;
  private readonly maxLength: number | null;
  private readonly maxString: number | null;
  private readonly maxDepth: number | null;
  private readonly expandAll: boolean;
  private readonly margin: number;
  private readonly insertLine: boolean;

  constructor(value: unknown, options: PrettyRenderOptions = {}) {
    this.value = value;
    this.highlighter = options.highlighter ?? new ReprHighlighter();
    this.indentSize = options.indentSize ?? 4;
    this.justify = options.justify ?? null;
    this.overflow = options.overflow ?? null;
    this.noWrap = options.noWrap ?? false;
    this.indentGuides = options.indentGuides ?? false;
    this.maxLength = options.maxLength ?? null;
    this.maxString = options.maxString ?? null;
    this.maxDepth = options.maxDepth ?? null;
    this.expandAll = options.expandAll ?? false;
    this.margin = options.margin ?? 0;
    this.insertLine = options.insertLine ?? false;
  }

  *__richConsole__(_console: Console, options: ConsoleOptions): RenderResult {
    let prettyStr = pretty_repr(this.value, {
      maxWidth: Math.max(1, (options.maxWidth ?? DEFAULT_MAX_WIDTH) - this.margin),
      indentSize: this.indentSize,
      maxDepth: this.maxDepth,
      maxLength: this.maxLength,
      maxString: this.maxString,
      expandAll: this.expandAll,
    });

    if (this.insertLine && prettyStr.includes('\n')) {
      prettyStr = `\n${prettyStr}`;
    }

    let prettyText = new Text(prettyStr, 'pretty', {
      justify: this.justify ?? undefined,
      overflow: this.overflow ?? undefined,
      noWrap: this.noWrap,
    });

    if (prettyText && this.highlighter) {
      this.highlighter.highlight(prettyText);
    }

    if (this.indentGuides) {
      prettyText = prettyText.withIndentGuides(this.indentSize, { style: 'repr.indent' });
    }

    yield prettyText;
  }

  __richMeasure__(_console: Console, options: ConsoleOptions): Measurement {
    const widthBudget = Math.max(1, (options.maxWidth ?? DEFAULT_MAX_WIDTH) - this.margin);
    const prettyStr = pretty_repr(this.value, {
      maxWidth: widthBudget,
      indentSize: this.indentSize,
      maxDepth: this.maxDepth,
      maxLength: this.maxLength,
      maxString: this.maxString,
      expandAll: this.expandAll,
    });
    const lines = prettyStr.split('\n');
    const width = lines.length === 0 ? 0 : Math.max(...lines.map((line) => cellLen(line)));
    return new Measurement(width, width);
  }
}

export function pprint(value: unknown, options: PPrintOptions = {}): void {
  const { console: consoleInstance = new Console(), ...prettyOptions } = options;
  consoleInstance.print(new Pretty(value, prettyOptions));
}

export function install(
  consoleInstance: Console = new Console(),
  options: PrettyRenderOptions = {}
): (value: unknown) => void {
  return (value: unknown) => {
    if (value === undefined) {
      return;
    }
    const renderable: ConsoleRenderable = hasRichConsole(value)
      ? (value as ConsoleRenderable)
      : new Pretty(value, options);
    consoleInstance.print(renderable);
  };
}

export function _ipy_display_hook(
  value: unknown,
  options: PrettyRenderOptions = {}
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (hasRichConsole(value)) {
    return undefined;
  }
  return pretty_repr(value, options);
}

export function pretty_repr(value: unknown, options: PrettyReprOptions = {}): string {
  const normalized: NormalizedOptions = {
    maxWidth: options.maxWidth ?? DEFAULT_OPTIONS.maxWidth,
    indentSize: options.indentSize ?? DEFAULT_OPTIONS.indentSize,
    maxDepth: options.maxDepth ?? DEFAULT_OPTIONS.maxDepth,
    maxLength: options.maxLength ?? DEFAULT_OPTIONS.maxLength,
    maxString: options.maxString ?? DEFAULT_OPTIONS.maxString,
    expandAll: options.expandAll ?? DEFAULT_OPTIONS.expandAll,
  };

  const context: FormatContext = {
    options: normalized,
    seen: new WeakSet<object>(),
  };

  return formatValue(value, context, 0, 0);
}

function hasRichConsole(value: unknown): value is { __richConsole__: unknown } {
  return Boolean(value && typeof value === 'object' && '__richConsole__' in value);
}

function formatValue(
  value: unknown,
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  if (value instanceof Node) {
    return value.toString();
  }

  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value === 'string') {
    return formatString(value, context.options.maxString);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value === 'function') {
    return value.name ? `[Function ${value.name}]` : '[Function]';
  }

  if (value instanceof Date) {
    return `Date("${value.toISOString()}")`;
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  if (context.seen.has(value)) {
    return cyclePlaceholder(value);
  }

  const { maxDepth } = context.options;
  if (maxDepth !== null && depth >= maxDepth) {
    return depthPlaceholder(value);
  }

  context.seen.add(value);
  try {
    if (isRichRepr(value)) {
      return formatRichRepr(value, context, depth, indentLevel);
    }
    if (Array.isArray(value)) {
      return formatArray(value, context, depth, indentLevel);
    }
    if (value instanceof Map) {
      return formatMap(value, context, depth, indentLevel);
    }
    if (value instanceof Set) {
      return formatSet(value, context, depth, indentLevel);
    }
    if (value instanceof Text) {
      return formatString(value.plain, context.options.maxString);
    }
    return formatObject(value as Record<string | symbol, unknown>, context, depth, indentLevel);
  } finally {
    context.seen.delete(value);
  }
}

function formatArray(
  arr: unknown[],
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  if (arr.length === 0) {
    return '[]';
  }
  const items = limitEntries(arr, context.options.maxLength);
  const childStrings = items.values.map((item) =>
    formatValue(item, context, depth + 1, indentLevel + 1)
  );
  if (items.truncated) {
    childStrings.push(`... +${items.remaining}`);
  }
  return surround('[', ']', childStrings, context, indentLevel);
}

function formatSet(
  set: Set<unknown>,
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  if (set.size === 0) {
    return 'set()';
  }
  const items = limitEntries(Array.from(set), context.options.maxLength);
  const childStrings = items.values.map((item) =>
    formatValue(item, context, depth + 1, indentLevel + 1)
  );
  if (items.truncated) {
    childStrings.push(`... +${items.remaining}`);
  }
  return surround('set([', '])', childStrings, context, indentLevel);
}

function formatMap(
  map: Map<unknown, unknown>,
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  if (map.size === 0) {
    return 'Map()';
  }
  const entries = Array.from(map.entries());
  const limited = limitEntries(entries, context.options.maxLength);
  const childStrings = limited.values.map(([key, val]) => {
    const keyStr = formatValue(key, context, depth + 1, indentLevel + 1);
    const valueStr = formatValue(val, context, depth + 1, indentLevel + 1);
    return `${keyStr} => ${valueStr}`;
  });
  if (limited.truncated) {
    childStrings.push(`... +${limited.remaining}`);
  }
  return surround('Map({', '})', childStrings, context, indentLevel);
}

function formatObject(
  obj: Record<string | symbol, unknown>,
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  const keys = Reflect.ownKeys(obj);
  if (keys.length === 0) {
    return '{}';
  }

  const limited = limitEntries(keys, context.options.maxLength);
  const childStrings = limited.values.map((key) => {
    const value = Reflect.get(obj, key);
    const valueStr = formatValue(value, context, depth + 1, indentLevel + 1);
    return `${formatKey(key)}: ${valueStr}`;
  });
  if (limited.truncated) {
    childStrings.push(`... +${limited.remaining}`);
  }
  return surround('{', '}', childStrings, context, indentLevel);
}

function formatKey(key: string | symbol): string {
  if (typeof key === 'symbol') {
    return key.toString();
  }
  return `${QUOTE}${escapeString(key)}${QUOTE}`;
}

function formatString(value: string, maxString: number | null): string {
  if (maxString !== null && value.length > maxString) {
    const truncated = value.slice(0, maxString);
    const remaining = value.length - maxString;
    return `${QUOTE}${escapeString(truncated)}${QUOTE}+${remaining}`;
  }
  return `${QUOTE}${escapeString(value)}${QUOTE}`;
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function surround(
  open: string,
  close: string,
  items: string[],
  context: FormatContext,
  indentLevel: number
): string {
  const body = items.join(', ');
  const inline = body.length === 0 ? `${open}${close}` : formatInline(open, close, body);
  if (!context.options.expandAll && inline.length <= context.options.maxWidth) {
    return inline;
  }
  const indent = ' '.repeat((indentLevel + 1) * context.options.indentSize);
  const closingIndent = ' '.repeat(indentLevel * context.options.indentSize);
  return `${open}\n${indent}${items.join(`,\n${indent}`)}\n${closingIndent}${close}`;
}

function formatInline(open: string, close: string, body: string): string {
  const bracketPairs: Record<string, string> = {
    '[': ']',
    '{': '}',
    '(': ')',
  };
  const lastOpen = open.slice(-1);
  const firstClose = close[0];
  if (bracketPairs[lastOpen] && bracketPairs[lastOpen] === firstClose) {
    return `${open}${body}${close}`;
  }
  return `${open} ${body} ${close}`;
}

interface LimitedEntries<T> {
  values: T[];
  truncated: boolean;
  remaining: number;
}

function limitEntries<T>(values: T[], maxLength: number | null): LimitedEntries<T> {
  if (maxLength === null || values.length <= maxLength) {
    return { values, truncated: false, remaining: 0 };
  }
  return {
    values: values.slice(0, maxLength),
    truncated: true,
    remaining: values.length - maxLength,
  };
}

function depthPlaceholder(value: unknown): string {
  if (Array.isArray(value)) {
    return '[...]';
  }
  if (value instanceof Set) {
    return 'set(...)';
  }
  if (value instanceof Map) {
    return 'Map(...)';
  }
  if (value && typeof value === 'object') {
    return '{...}';
  }
  return '...';
}

function cyclePlaceholder(value: unknown): string {
  if (Array.isArray(value)) {
    return '[...]';
  }
  if (value instanceof Set) {
    return 'set(...)';
  }
  if (value instanceof Map) {
    return 'Map(...)';
  }
  return '{...}';
}

interface RichReprProtocol {
  __rich_repr__(): RichReprResult;
}

function isRichRepr(value: unknown): value is RichReprProtocol {
  return Boolean(value && typeof (value as RichReprProtocol).__rich_repr__ === 'function');
}

function formatRichRepr(
  value: RichReprProtocol,
  context: FormatContext,
  depth: number,
  indentLevel: number
): string {
  const className = value.constructor?.name ?? 'Object';
  const parts: string[] = [];
  for (const entry of value.__rich_repr__()) {
    if (Array.isArray(entry)) {
      if (entry.length === 1) {
        parts.push(formatValue(entry[0], context, depth + 1, indentLevel + 1));
      } else {
        const [key, val, defaultVal] = entry as [string | null, unknown, unknown?];
        if (key === null) {
          parts.push(formatValue(val, context, depth + 1, indentLevel + 1));
        } else if (entry.length >= 3 && defaultVal !== undefined && Object.is(val, defaultVal)) {
          continue;
        } else {
          parts.push(`${key}=${formatValue(val, context, depth + 1, indentLevel + 1)}`);
        }
      }
    } else {
      parts.push(formatValue(entry, context, depth + 1, indentLevel + 1));
    }
  }
  return `${className}(${parts.join(', ')})`;
}
