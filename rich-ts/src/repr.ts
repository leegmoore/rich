/**
 * Rich repr protocol for pretty printing objects.
 *
 * This module provides a decorator system for generating readable string
 * representations of objects, similar to Python's __repr__.
 */

/**
 * Result value types that can be yielded from richRepr()
 * Can be a single value or tuple formats for key-value pairs
 */
export type RichReprTuple = [string | null, unknown] | [string, unknown, unknown];
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ResultValue = RichReprTuple | unknown;

/**
 * Result type for richRepr() generators.
 * Can yield:
 * - Single value: displayed as repr(value)
 * - 2-tuple [key, value]: displayed as key=repr(value), or just repr(value) if key is null
 * - 3-tuple [key, value, default]: displayed as key=repr(value) only if value !== default
 */
export type Result = Generator<ResultValue, void, undefined>;

/**
 * Error thrown when repr generation fails.
 */
export class ReprError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReprError';
  }
}

/**
 * Options for the auto decorator.
 */
export interface AutoOptions {
  /**
   * If true, use angular bracket style: <ClassName arg1 arg2>
   * If false, use function call style: ClassName(arg1, arg2)
   */
  angular?: boolean;
}

/**
 * Interface for objects that implement rich repr.
 */
export interface RichReprObject {
  richRepr(): Result;
}

/**
 * Constructor type that can be decorated.
 */
export type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Decorator to generate toString() from richRepr() method.
 *
 * @example
 * ```typescript
 * class Foo {
 *   constructor(public name: string, public value: number = 0) {}
 *
 *   *richRepr(): Result {
 *     yield this.name;
 *     if (this.value !== 0) {
 *       yield ['value', this.value];
 *     }
 *   }
 * }
 *
 * auto()(Foo);
 * console.log(String(new Foo('test', 5))); // "Foo('test', value=5)"
 * ```
 *
 * @param options - Optional configuration
 * @returns Decorator function
 */
export function auto(options: AutoOptions = {}): <T extends Constructor>(constructor: T) => T {
  return function <T extends Constructor>(constructor: T): T {
    const { angular = false } = options;
    const constructorName = constructor.name;

    // Replace toString method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    constructor.prototype.toString = function (this: RichReprObject & object): string {
      try {
        const reprStrings: string[] = [];

        // Check if richRepr method exists
        if (typeof this.richRepr !== 'function') {
          throw new ReprError(`Class ${constructorName} does not have a richRepr() method`);
        }

        // Check angular mode from method property or options
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const richReprFn: (() => Result) & { angular?: boolean } = this
          .richRepr as (() => Result) & { angular?: boolean };
        const useAngular = richReprFn.angular ?? angular;

        // Iterate over richRepr generator
        const generator = this.richRepr();
        for (const arg of generator) {
          // Check if it's a tuple format (2 or 3 elements with string/null key)
          if (
            Array.isArray(arg) &&
            arg.length >= 2 &&
            arg.length <= 3 &&
            (typeof arg[0] === 'string' || arg[0] === null)
          ) {
            // This is a tuple format: [key, value] or [key, value, default]
            if (arg.length === 2) {
              // 2-tuple: [key, value] or [null, value]
              const [key, value] = arg as [string | null, unknown];
              if (key === null) {
                reprStrings.push(formatValue(value));
              } else {
                reprStrings.push(`${key}=${formatValue(value)}`);
              }
            } else if (arg.length === 3) {
              // 3-tuple: [key, value, default]
              const [key, value, defaultValue] = arg as [string, unknown, unknown];
              if (key === null) {
                reprStrings.push(formatValue(value));
              } else {
                // Only include if value differs from default
                if (value !== defaultValue) {
                  reprStrings.push(`${key}=${formatValue(value)}`);
                }
              }
            }
          } else {
            // Plain value (including arrays)
            reprStrings.push(formatValue(arg));
          }
        }

        if (useAngular) {
          return `<${constructorName} ${reprStrings.join(' ')}>`;
        } else {
          return `${constructorName}(${reprStrings.join(', ')})`;
        }
      } catch (error) {
        if (error instanceof ReprError) {
          throw error;
        }
        throw new ReprError(
          `Failed to generate repr for ${constructorName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    return constructor;
  };
}

/**
 * Format a value for display in repr string.
 */
function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    // Use single quotes for strings, escape single quotes
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    // Try toString() method
    const obj = value as { toString?: () => string };
    if (typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
      return obj.toString();
    }
    // Fall back to JSON-like representation
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Alias for auto() decorator.
 * Provides compatibility with Python's rich.repr.rich_repr.
 */
export function richRepr(options: AutoOptions = {}): <T extends Constructor>(constructor: T) => T {
  return auto(options);
}
