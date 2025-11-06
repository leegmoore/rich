/**
 * Protocol utilities for checking if objects are renderable.
 */

/**
 * Check if an object may be rendered by Rich.
 *
 * @param checkObject - Object to check.
 * @returns True if the object is renderable.
 */
export function isRenderable(checkObject: unknown): boolean {
  if (typeof checkObject === 'string') {
    return true;
  }
  if (checkObject && typeof checkObject === 'object') {
    return '__rich__' in checkObject || '__richConsole__' in checkObject;
  }
  return false;
}
