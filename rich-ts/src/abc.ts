import type { Console, ConsoleOptions, RenderResult } from './console.js';

/**
 * Interface describing objects that expose the Rich console protocol.
 */
export interface RichConsoleRenderable {
  __richConsole__(console: Console, options: ConsoleOptions): RenderResult;
}

/**
 * Interface describing objects that can convert themselves to a renderable object.
 */
export interface RichProtocolRenderable {
  __rich__(): unknown;
}

/**
 * Objects that satisfy either Rich protocol.
 */
export type RichRenderableLike = Partial<RichConsoleRenderable & RichProtocolRenderable> & object;

const CONSOLE_KEYS = ['__richConsole__', '__rich_console__'] as const;

function hasRichMember(target: object): boolean {
  const candidate = target as Record<PropertyKey, unknown>;
  if ('__rich__' in candidate) {
    return true;
  }
  return CONSOLE_KEYS.some((key) => key in candidate);
}

function supportsRichProtocol(value: unknown): value is RichRenderableLike {
  if (!value) {
    return false;
  }
  if (typeof value === 'function') {
    const fnTarget = value as unknown as Record<PropertyKey, unknown>;
    if (hasRichMember(fnTarget)) {
      return true;
    }
    const prototype = (value as { prototype?: unknown }).prototype;
    if (prototype && typeof prototype === 'object' && hasRichMember(prototype)) {
      return true;
    }
  }
  if (typeof value === 'object') {
    return hasRichMember(value);
  }
  return false;
}

/**
 * Abstract base class mirroring Rich's ``RichRenderable`` ABC.
 *
 * Usage mirrors Python's ``isinstance(foo, RichRenderable)`` via ``instanceof``.
 */
export abstract class RichRenderable {
  static [Symbol.hasInstance](instance: unknown): boolean {
    return supportsRichProtocol(instance);
  }

  /**
   * Type guard equivalent for non-`instanceof` cases.
   */
  static isRenderable(value: unknown): value is RichRenderableLike {
    return supportsRichProtocol(value);
  }
}

/**
 * Convenience function wrapper around {@link RichRenderable.isRenderable}.
 */
export function isRichRenderable(value: unknown): value is RichRenderableLike {
  return RichRenderable.isRenderable(value);
}
