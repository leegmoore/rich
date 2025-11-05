/**
 * An error in console operation.
 */
export class ConsoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConsoleError';
    Object.setPrototypeOf(this, ConsoleError.prototype);
  }
}

/**
 * An error in styles.
 */
export class StyleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StyleError';
    Object.setPrototypeOf(this, StyleError.prototype);
  }
}

/**
 * Style was badly formatted.
 */
export class StyleSyntaxError extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'StyleSyntaxError';
    Object.setPrototypeOf(this, StyleSyntaxError.prototype);
  }
}

/**
 * No such style.
 */
export class MissingStyle extends StyleError {
  constructor(message: string) {
    super(message);
    this.name = 'MissingStyle';
    Object.setPrototypeOf(this, MissingStyle.prototype);
  }
}

/**
 * Style stack is invalid.
 */
export class StyleStackError extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'StyleStackError';
    Object.setPrototypeOf(this, StyleStackError.prototype);
  }
}

/**
 * Object is not renderable.
 */
export class NotRenderableError extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'NotRenderableError';
    Object.setPrototypeOf(this, NotRenderableError.prototype);
  }
}

/**
 * Markup was badly formatted.
 */
export class MarkupError extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'MarkupError';
    Object.setPrototypeOf(this, MarkupError.prototype);
  }
}

/**
 * Error related to Live display.
 */
export class LiveError extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'LiveError';
    Object.setPrototypeOf(this, LiveError.prototype);
  }
}

/**
 * Alt screen mode was required.
 */
export class NoAltScreen extends ConsoleError {
  constructor(message: string) {
    super(message);
    this.name = 'NoAltScreen';
    Object.setPrototypeOf(this, NoAltScreen.prototype);
  }
}
