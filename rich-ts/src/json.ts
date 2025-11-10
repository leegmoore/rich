import { JSONHighlighter, NullHighlighter } from './highlighter.js';
import { Text } from './text.js';

const NativeJSON = globalThis.JSON;

export type JsonIndent = number | string | null;

export type JsonValueTransformer = (value: unknown) => unknown;

export interface JsonOptions {
  indent?: JsonIndent;
  highlight?: boolean;
  sortKeys?: boolean;
  default?: JsonValueTransformer;
}

/**
 * Renderable that pretty prints JSON data with optional syntax highlighting.
 */
export class RichJSON {
  readonly text: Text;

  constructor(json: string, options: JsonOptions = {}) {
    const data = parseJson(json);
    this.text = renderJsonText(data, options);
  }

  static fromData(data: unknown, options: JsonOptions = {}): RichJSON {
    const instance = Object.create(this.prototype) as Omit<RichJSON, 'text'> & { text: Text };
    instance.text = renderJsonText(data, options);
    return instance;
  }

  __rich__(): Text {
    return this.text;
  }
}

export { RichJSON as JSON };

function parseJson(json: string): unknown {
  try {
    return NativeJSON.parse(json);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to parse JSON data: ${reason}`);
  }
}

function renderJsonText(data: unknown, options: JsonOptions): Text {
  const jsonString = stringifyData(data, options);
  const highlight = options.highlight ?? true;
  const highlighter = highlight ? new JSONHighlighter() : new NullHighlighter();
  const text = highlighter.call(jsonString);
  text.noWrap = true;
  text.overflow = 'ignore';
  return text;
}

function stringifyData(data: unknown, options: JsonOptions): string {
  const indent = normalizeIndent(options.indent);
  const normalized = data === undefined ? null : data;
  const transformed = options.default
    ? applyDefaultTransform(normalized, options.default)
    : normalized;
  const prepared = options.sortKeys ? sortKeysRecursive(transformed) : transformed;
  try {
    const result = NativeJSON.stringify(prepared, undefined, indent);
    return typeof result === 'string' ? result : 'null';
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to encode JSON data: ${reason}`);
  }
}

function normalizeIndent(indent: JsonIndent | undefined): number | string | undefined {
  if (indent === null) {
    return undefined;
  }
  if (indent === undefined) {
    return 2;
  }
  if (typeof indent === 'number') {
    if (!Number.isFinite(indent)) {
      return undefined;
    }
    const clamped = Math.max(0, Math.min(10, Math.trunc(indent)));
    return clamped === 0 ? undefined : clamped;
  }
  if (typeof indent === 'string') {
    const trimmed = indent.slice(0, 10);
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return 2;
}

function sortKeysRecursive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysRecursive(item));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    const source = value;
    for (const key of Object.keys(source).sort()) {
      result[key] = sortKeysRecursive(source[key]);
    }
    return result;
  }
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

function applyDefaultTransform(value: unknown, transformer: JsonValueTransformer): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => applyDefaultTransform(item, transformer));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    const source = value;
    for (const key of Object.keys(source)) {
      result[key] = applyDefaultTransform(source[key], transformer);
    }
    return result;
  }
  if (shouldApplyDefault(value)) {
    return transformer(value);
  }
  return value;
}

function shouldApplyDefault(value: unknown): boolean {
  if (value === null) {
    return false;
  }
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  if (isPlainObject(value)) {
    return false;
  }
  return true;
}
