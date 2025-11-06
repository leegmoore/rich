/**
 * STUB: Theme class for style lookups
 * TODO: Full implementation in Phase 6 with config file loading
 */
import { Style, StyleType } from './style.js';
import { DEFAULT_STYLES } from './default_styles.js';

export class Theme {
  styles: Record<string, Style>;

  constructor(styles?: Record<string, StyleType>, inherit: boolean = true) {
    this.styles = inherit ? { ...DEFAULT_STYLES } : {};
    if (styles) {
      for (const [name, style] of Object.entries(styles)) {
        this.styles[name] = typeof style === 'string' ? Style.parse(style) : style;
      }
    }
  }
}
