/**
 * Theme - Container for style information
 * Based on rich/theme.py
 */
import { Style, StyleType } from './style.js';
import { DEFAULT_STYLES } from './default_styles.js';

export class Theme {
  /**
   * A container for style information, used by Console.
   *
   * @param styles - A mapping of style names to styles. Defaults to undefined for a theme with no styles.
   * @param inherit - Inherit default styles. Defaults to true.
   */
  styles: Record<string, Style>;

  constructor(styles?: Record<string, StyleType>, inherit: boolean = true) {
    this.styles = inherit ? { ...DEFAULT_STYLES } : {};
    if (styles) {
      for (const [name, style] of Object.entries(styles)) {
        this.styles[name] = typeof style === 'string' ? Style.parse(style) : style;
      }
    }
  }

  /**
   * Get contents of a config file for this theme.
   */
  get config(): string {
    const sortedEntries = Object.entries(this.styles).sort(([a], [b]) => a.localeCompare(b));
    const lines = sortedEntries.map(([name, style]) => `${name} = ${style.toString()}`);
    return '[styles]\n' + lines.join('\n');
  }

  /**
   * Load a theme from a text mode file.
   *
   * @param configText - The contents of a config file.
   * @param inherit - Inherit default styles. Defaults to true.
   * @returns A new theme instance.
   */
  static fromFile(configText: string, inherit: boolean = true): Theme {
    const styles: Record<string, StyleType> = {};

    // Simple INI parser for [styles] section
    const lines = configText.split('\n');
    let inStylesSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for section header
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        const sectionName = trimmedLine.slice(1, -1).trim();
        inStylesSection = sectionName === 'styles';
        continue;
      }

      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith(';')) {
        continue;
      }

      // Parse key = value pairs
      if (inStylesSection && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const name = key?.trim() ?? '';
        const value = valueParts.join('=').trim();
        if (name && value) {
          styles[name] = Style.parse(value);
        }
      }
    }

    return new Theme(styles, inherit);
  }

  /**
   * Read a theme from a path using Node.js fs.
   * Note: This is a Node.js-only method and will not work in browsers.
   *
   * @param path - Path to a config file.
   * @param inherit - Inherit default styles. Defaults to true.
   * @returns A new theme instance.
   */
  static async read(path: string, inherit: boolean = true): Promise<Theme> {
    // Dynamic import of fs for Node.js only
    try {
      const fs = await import('fs');
      const configText = await fs.promises.readFile(path, 'utf-8');
      return Theme.fromFile(configText, inherit);
    } catch (error) {
      throw new Error(
        `Failed to read theme from ${path}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Base exception for errors related to the theme stack.
 */
export class ThemeStackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeStackError';
  }
}

/**
 * A stack of themes.
 */
export class ThemeStack {
  private entries: Array<Record<string, Style>>;
  get: (name: string) => Style | undefined;

  /**
   * Create a theme stack.
   *
   * @param theme - A theme instance.
   */
  constructor(theme: Theme) {
    this.entries = [theme.styles];
    this.get = (name: string) => this.entries[this.entries.length - 1]?.[name];
  }

  /**
   * Push a theme on the top of the stack.
   *
   * @param theme - A Theme instance.
   * @param inherit - Inherit styles from current top of stack.
   */
  pushTheme(theme: Theme, inherit: boolean = true): void {
    const styles: Record<string, Style> = inherit
      ? { ...this.entries[this.entries.length - 1], ...theme.styles }
      : { ...theme.styles };
    this.entries.push(styles);
    this.get = (name: string) => this.entries[this.entries.length - 1]?.[name];
  }

  /**
   * Pop (and discard) the top-most theme.
   */
  popTheme(): void {
    if (this.entries.length === 1) {
      throw new ThemeStackError('Unable to pop base theme');
    }
    this.entries.pop();
    this.get = (name: string) => this.entries[this.entries.length - 1]?.[name];
  }
}
