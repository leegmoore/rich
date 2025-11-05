/**
 * Rich repr protocol for pretty printing objects.
 *
 * This module provides decorators and utilities for creating rich representations
 * of custom objects, similar to Python's __repr__ but with more formatting options.
 */

/**
 * Result type for __rich_repr__ methods.
 * Can yield:
 * - Any value (positional argument)
 * - [value] (positional argument in array)
 * - [null, value] (unnamed argument)
 * - [key, value] (named argument)
 * - [key, value, default] (named argument with default)
 */
export type Result = Array<
  unknown | [unknown] | [null, unknown] | [string, unknown] | [string, unknown, unknown]
>;

/**
 * Alias for Result type
 */
export type RichReprResult = Result;

/**
 * An error occurred when attempting to build a repr.
 */
export class ReprError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReprError';
  }
}

/**
 * Options for the auto decorator
 */
export interface AutoOptions {
  angular?: boolean;
}

/**
 * Interface for classes with __rich_repr__ method
 */
export interface RichReprProtocol {
  __rich_repr__(): Result;
  __repr__(): string;
}

/**
 * Type for __rich_repr__ function with optional angular property
 */
interface RichReprFunction {
  (): Result;
  __angular__?: boolean;
}

/**
 * Class decorator to create __repr__ from __rich_repr__.
 *
 * Can be used as:
 * - auto(MyClass)
 * - auto(MyClass, { angular: true })
 *
 * If the class doesn't have __rich_repr__, it will be auto-generated
 * from the constructor signature.
 *
 * @param cls - The class to decorate
 * @param options - Options for the decorator
 * @returns The decorated class with __repr__ method
 */
export function auto<T extends new (...args: unknown[]) => unknown>(
  cls: T,
  options: AutoOptions = {},
): T {
  const { angular = false } = options;

  // Create the __repr__ method
  function autoRepr(this: RichReprProtocol): string {
    const reprStr: string[] = [];

    // Check if __rich_repr__ has angular property
    const richReprFn = this.__rich_repr__ as RichReprFunction;
    const isAngular = richReprFn.__angular__ ?? angular;

    // Call __rich_repr__ and process each yielded value
    for (const arg of this.__rich_repr__()) {
      if (Array.isArray(arg)) {
        // Check if this is a named argument tuple or an actual array value
        if (arg.length === 1) {
          // Single-element array: could be [value] wrapper or actual array
          // If the element is NOT an array, treat as wrapper and unwrap
          // If the element IS an array, treat as actual array value
          if (!Array.isArray(arg[0])) {
            // [value] wrapper - unwrap it
            reprStr.push(formatValue(arg[0]));
          } else {
            // [[...]] - actual array value
            reprStr.push(formatValue(arg));
          }
        } else if (arg.length >= 2 && (typeof arg[0] === 'string' || arg[0] === null)) {
          // Named argument tuple
          const [key, value, ...defaultValue] = arg;
          if (key === null) {
            // [null, value] - unnamed argument
            reprStr.push(formatValue(value));
          } else {
            // [key, value] or [key, value, default]
            if (defaultValue.length > 0 && defaultValue[0] === value) {
              // Skip if value equals default
              continue;
            }
            reprStr.push(`${key}=${formatValue(value)}`);
          }
        } else {
          // This is an actual array value, not a wrapper
          reprStr.push(formatValue(arg));
        }
      } else {
        // Plain value - positional argument
        reprStr.push(formatValue(arg));
      }
    }

    if (isAngular) {
      return `<${cls.name} ${reprStr.join(' ')}>`;
    } else {
      return `${cls.name}(${reprStr.join(', ')})`;
    }
  }

  // Auto-generate __rich_repr__ if it doesn't exist
  if (!cls.prototype.__rich_repr__) {
    function autoRichRepr(this: Record<string, unknown>): Result {
      try {
        const result: Result = [];

        // Get constructor parameters
        // Note: TypeScript type info is erased at runtime, so we can't reliably
        // introspect parameter defaults like Python's inspect.signature()
        // We use a heuristic: first parameter is positional, rest are named if not undefined
        const instance = this;
        const constructor = this.constructor;

        // Try to get parameter names from constructor
        const constructorStr = constructor.toString();
        // Find constructor parameters, handling nested parentheses
        const constructorStart = constructorStr.indexOf('constructor');
        if (constructorStart === -1) {
          return result;
        }

        const paramsStart = constructorStr.indexOf('(', constructorStart);
        if (paramsStart === -1) {
          return result;
        }

        // Manually parse to find matching closing paren
        let depth = 1;
        let paramsEnd = paramsStart + 1;
        while (depth > 0 && paramsEnd < constructorStr.length) {
          if (constructorStr[paramsEnd] === '(') depth++;
          else if (constructorStr[paramsEnd] === ')') depth--;
          paramsEnd++;
        }

        const paramsStr = constructorStr.substring(paramsStart + 1, paramsEnd - 1);

        if (paramsStr) {
          // Split parameters carefully, keeping track of which have defaults
          const paramParts = paramsStr
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => p);

          for (const paramStr of paramParts) {
            // Check if this parameter has a default value (contains '=')
            const hasDefault = paramStr.includes('=');

            // Extract parameter name and default value
            let name: string;
            let defaultValue: unknown = undefined;

            if (hasDefault) {
              const parts = paramStr.split('=');
              name = parts[0].trim();
              // Extract default value string (simplified - doesn't handle complex expressions)
              const defaultStr = parts[1].trim();

              // Try to evaluate simple default values
              try {
                // Handle simple cases: true, false, numbers, strings, null, undefined
                if (defaultStr === 'true') defaultValue = true;
                else if (defaultStr === 'false') defaultValue = false;
                else if (defaultStr === 'null') defaultValue = null;
                else if (defaultStr === 'undefined') defaultValue = undefined;
                else if (/^-?\d+$/.test(defaultStr)) defaultValue = parseInt(defaultStr);
                else if (/^-?\d+\.\d+$/.test(defaultStr)) defaultValue = parseFloat(defaultStr);
                // For complex defaults like new StupidClass(2), we can't easily evaluate
                // so we leave it as undefined (will always show the parameter)
              } catch {
                // If we can't parse the default, use undefined
                defaultValue = undefined;
              }
            } else {
              name = paramStr.split(/[=:]/)[0].trim();
            }

            // Remove modifiers
            name = name.replace(/^(public|private|protected|readonly)\s+/, '');
            // Remove ? suffix and type annotations
            name = (name.split(':')[0] ?? name).trim();
            name = name.replace(/\?$/, '');

            // Check if property exists on instance
            if (!(name in instance)) {
              throw new ReprError(
                `Failed to auto generate __rich_repr__; property '${name}' not found on instance`
              );
            }

            const value = instance[name];

            if (hasDefault) {
              // Parameter has a default - use named format
              // Skip if value is undefined or equals the default
              if (value !== undefined && value !== defaultValue) {
                result.push([name, value, defaultValue]);
              }
            } else {
              // Parameter has no default - use positional format
              // Wrap in [null, value] to avoid ambiguity with array values
              result.push([null, value]);
            }
          }
        }

        return result;
      } catch (error) {
        throw new ReprError(
          `Failed to auto generate __rich_repr__; ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    cls.prototype.__rich_repr__ = autoRichRepr;
  }

  // Add __repr__ method
  cls.prototype.__repr__ = autoRepr;

  // Set angular property if specified
  if (angular) {
    (cls.prototype.__rich_repr__ as RichReprFunction).__angular__ = true;
  }

  return cls;
}

/**
 * Alias for auto decorator.
 * Class decorator to create __repr__ from __rich_repr__.
 */
export function richRepr<T extends new (...args: unknown[]) => unknown>(
  cls: T,
  options: AutoOptions = {},
): T {
  return auto(cls, options);
}

/**
 * Format a value for repr output.
 * Similar to Python's repr() function.
 */
function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    // Check if object has __repr__ method
    if ('__repr__' in value && typeof value.__repr__ === 'function') {
      return (value.__repr__ as () => string)();
    }
    // Check if object has toString that's not the default
    const str = value.toString();
    if (str !== '[object Object]') {
      return str;
    }
    // Default object representation
    if ('constructor' in value && typeof value.constructor === 'function') {
      return `${value.constructor.name}()`;
    }
    return '[object Object]';
  }
  return String(value);
}
