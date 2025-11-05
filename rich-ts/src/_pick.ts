/**
 * Utility function for picking first non-null boolean value.
 */

/**
 * Pick the first non-null/undefined bool or return the last value.
 *
 * @param values - Any number of boolean or null/undefined values.
 * @returns First non-null/undefined boolean.
 */
export function pickBool(...values: Array<boolean | undefined>): boolean {
  if (values.length === 0) {
    throw new Error('1 or more values required');
  }

  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }

  // Return the last value coerced to boolean
  return Boolean(values[values.length - 1]);
}
