import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { cellLen, setCellSize } from './cells.js';
import { Measurement } from './measure.js';
import { Style } from './style.js';
import { Text } from './text.js';

/**
 * Alignment methods for rule titles.
 */
export type AlignMethod = 'left' | 'center' | 'right';

/**
 * Options for creating a Rule instance.
 */
export interface RuleOptions {
  characters?: string;
  style?: string | Style;
  end?: string;
  align?: AlignMethod;
}

/**
 * A console renderable to draw a horizontal rule (line).
 *
 * @example
 * ```typescript
 * console.print(new Rule('Section Title'));
 * console.print(new Rule('', { characters: '=' }));
 * ```
 */
export class Rule {
  public readonly title: string | Text;
  public readonly characters: string;
  public readonly style: string | Style;
  public readonly end: string;
  public readonly align: AlignMethod;

  /**
   * Create a new Rule instance.
   *
   * @param title - Text to render in the rule. Defaults to "".
   * @param options - Additional options.
   * @param options.characters - Character(s) used to draw the line. Defaults to "─".
   * @param options.style - Style of Rule. Defaults to "rule.line".
   * @param options.end - Character at end of Rule. Defaults to "\n".
   * @param options.align - How to align the title: "left", "center", or "right". Defaults to "center".
   */
  constructor(title: string | Text = '', options: RuleOptions = {}) {
    const characters = options.characters ?? '─';
    const align = options.align ?? 'center';

    if (cellLen(characters) < 1) {
      throw new Error("'characters' argument must have a cell width of at least 1");
    }
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      throw new Error(
        `invalid value for align, expected "left", "center", "right" (not ${JSON.stringify(align)})`
      );
    }

    this.title = title;
    this.characters = characters;
    this.style = options.style ?? 'rule.line';
    this.end = options.end ?? '\n';
    this.align = align;
  }

  /**
   * String representation of the Rule instance.
   */
  toString(): string {
    return `Rule(${JSON.stringify(this.title)}, ${JSON.stringify(this.characters)})`;
  }

  /**
   * Rich console rendering protocol.
   */
  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.maxWidth ?? 80;

    // Resolve style through console (enables theme lookups)
    const ruleStyle = console.getStyle(this.style);

    // Use ASCII dash if asciiOnly and characters contain non-ASCII
    const characters =
      // eslint-disable-next-line no-control-regex
      options.asciiOnly && !this.characters.match(/^[\x00-\x7F]*$/) ? '-' : this.characters;

    const charsLen = cellLen(characters);

    if (!this.title || (typeof this.title === 'string' && this.title.length === 0)) {
      yield this._ruleLine(charsLen, width, ruleStyle);
      return;
    }

    let titleText: Text;
    if (this.title instanceof Text) {
      titleText = this.title;
    } else {
      titleText = console.renderStr(this.title, { style: 'rule.text' });
    }

    // Replace newlines with spaces and expand tabs
    titleText.plain = titleText.plain.replace(/\n/g, ' ');
    titleText.expandTabs();

    const requiredSpace = this.align === 'center' ? 4 : 2;
    const truncateWidth = Math.max(0, width - requiredSpace);
    if (truncateWidth === 0) {
      yield this._ruleLine(charsLen, width, ruleStyle);
      return;
    }

    const ruleText = new Text('', undefined, { end: this.end, noWrap: true, overflow: 'ignore' });

    if (this.align === 'center') {
      titleText.truncate(truncateWidth, { overflow: 'ellipsis' });
      const sideWidth = Math.floor((width - cellLen(titleText.plain)) / 2);
      const left = new Text(characters.repeat(Math.floor(sideWidth / charsLen) + 1));
      left.truncate(sideWidth - 1);
      const rightLength = width - cellLen(left.plain) - cellLen(titleText.plain);
      const right = new Text(characters.repeat(Math.floor(sideWidth / charsLen) + 1));
      right.truncate(rightLength);
      ruleText.append(left.plain + ' ', ruleStyle);
      ruleText.append(titleText);
      ruleText.append(' ' + right.plain, ruleStyle);
    } else if (this.align === 'left') {
      titleText.truncate(truncateWidth, { overflow: 'ellipsis' });
      ruleText.append(titleText);
      ruleText.append(' ');
      ruleText.append(characters.repeat(width - ruleText.cellLen), ruleStyle);
    } else if (this.align === 'right') {
      titleText.truncate(truncateWidth, { overflow: 'ellipsis' });
      ruleText.append(characters.repeat(width - titleText.cellLen - 1), ruleStyle);
      ruleText.append(' ');
      ruleText.append(titleText);
    }

    ruleText.plain = setCellSize(ruleText.plain, width);
    yield ruleText;
  }

  /**
   * Generate a plain rule line without title.
   */
  private _ruleLine(charsLen: number, width: number, style: Style): Text {
    const ruleText = new Text(this.characters.repeat(Math.floor(width / charsLen) + 1), style, { end: this.end, noWrap: true, overflow: 'ignore' });
    ruleText.truncate(width);
    ruleText.plain = setCellSize(ruleText.plain, width);
    return ruleText;
  }

  /**
   * Rich measure protocol.
   */
  __richMeasure__(_console: Console, options: ConsoleOptions): Measurement {
    // Rule always takes full width, so return maxWidth for both min and max
    const width = options.maxWidth ?? 80;
    return new Measurement(width, width);
  }
}
