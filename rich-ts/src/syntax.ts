import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

import { blendRgb, Color } from './color.js';
import type { ConsoleOptions, JustifyMethod, RenderResult } from './console.js';
import { Console } from './console.js';
import { loopFirst } from './_loop.js';
import { Measurement } from './measure.js';
import { Padding, type PaddingDimensions } from './padding.js';
import { Segment } from './segment.js';
import { Style, type StyleType } from './style.js';
import { Text } from './text.js';

const NUMBERS_COLUMN_DEFAULT_PADDING = 2;

type SyntaxLineRange = [number | null, number | null] | undefined;
type SyntaxPosition = [number, number];

interface SyntaxTheme {
  getBackgroundStyle(): Style;
}

class SimpleSyntaxTheme implements SyntaxTheme {
  constructor(private readonly style: Style) {}

  getBackgroundStyle(): Style {
    return this.style;
  }
}

const THEME_BACKGROUNDS: Record<string, Style> = {
  monokai: new Style({ bgcolor: '#272822' }),
  'ansi-dark': new Style({ bgcolor: '#000000' }),
  ansi_dark: new Style({ bgcolor: '#000000' }),
  'ansi-light': new Style({ bgcolor: '#ffffff' }),
  ansi_light: new Style({ bgcolor: '#ffffff' }),
  default: new Style({ bgcolor: '#1e1e1e' }),
};

export interface SyntaxOptions {
  theme?: string | SyntaxTheme;
  dedent?: boolean;
  lineNumbers?: boolean;
  startLine?: number;
  lineRange?: SyntaxLineRange;
  highlightLines?: Iterable<number>;
  codeWidth?: number;
  tabSize?: number;
  wordWrap?: boolean;
  backgroundColor?: string;
  indentGuides?: boolean;
  padding?: PaddingDimensions;
}

export class SyntaxHighlightRange {
  readonly style: StyleType;
  readonly start: SyntaxPosition;
  readonly end: SyntaxPosition;
  readonly styleBefore: boolean;

  constructor(style: StyleType, start: SyntaxPosition, end: SyntaxPosition, styleBefore = false) {
    this.style = style;
    this.start = start;
    this.end = end;
    this.styleBefore = styleBefore;
  }
}

export class Syntax {
  readonly code: string;
  readonly lexer?: string;
  readonly dedent: boolean;
  readonly lineNumbers: boolean;
  readonly startLine: number;
  readonly lineRange?: SyntaxLineRange;
  readonly codeWidth?: number;
  readonly tabSize: number;
  readonly wordWrap: boolean;
  readonly indentGuides: boolean;

  private readonly highlightLines: Set<number>;
  private readonly theme: SyntaxTheme;
  private _padding: [number, number, number, number];
  private readonly backgroundStyle: Style;
  private readonly stylizedRanges: SyntaxHighlightRange[] = [];

  constructor(code: string, lexer?: string, options: SyntaxOptions = {}) {
    this.code = code;
    this.lexer = lexer;
    this.dedent = options.dedent ?? false;
    this.lineNumbers = options.lineNumbers ?? false;
    this.startLine = options.startLine ?? 1;
    this.lineRange = options.lineRange;
    this.codeWidth = options.codeWidth;
    this.tabSize = options.tabSize ?? 4;
    this.wordWrap = options.wordWrap ?? false;
    this.indentGuides = options.indentGuides ?? false;
    this.highlightLines = new Set(options.highlightLines ?? []);
    this.theme = Syntax.getTheme(options.theme ?? 'monokai');
    this._padding = Padding.unpack(options.padding ?? 0);
    this.backgroundStyle = options.backgroundColor
      ? new Style({ bgcolor: options.backgroundColor })
      : Style.null();
  }

  static getTheme(theme: string | SyntaxTheme): SyntaxTheme {
    if (typeof theme !== 'string') return theme;
    const normalized = theme.toLowerCase();
    const candidate = THEME_BACKGROUNDS[normalized];
    return new SimpleSyntaxTheme((candidate ?? THEME_BACKGROUNDS.default) as Style);
  }

  static fromPath(
    path: string,
    options: Omit<SyntaxOptions, 'lineRange'> & { lexer?: string } = {}
  ): Syntax {
    const code = readFileSync(path, 'utf-8');
    const lexer = options.lexer ?? Syntax.guessLexer(path, code);
    return new Syntax(code, lexer, options);
  }

  static guessLexer(path: string, code?: string): string | undefined {
    const extension = extname(path).replace('.', '').toLowerCase();
    if (extension) {
      if (extension === 'py') return 'python';
      if (extension === 'js') return 'javascript';
      if (extension === 'ts') return 'typescript';
      if (extension === 'json') return 'json';
      if (extension === 'html') return 'html';
    }
    const snippet = (code ?? '').trimStart();
    if (snippet.startsWith('<')) return 'html';
    if (/^\s*(import|def|class)\s+/m.test(snippet)) return 'python';
    return undefined;
  }

  get padding(): [number, number, number, number] {
    return this._padding;
  }

  set padding(pad: PaddingDimensions) {
    this._padding = Padding.unpack(pad);
  }

  addHighlightRange(range: SyntaxHighlightRange): void {
    this.stylizedRanges.push(range);
  }

  highlight(
    code: string,
    lineRange?: SyntaxLineRange,
    options: { justify?: JustifyMethod } = {}
  ): Text {
    const baseStyle = this.getBaseStyle();
    const text = new Text(code, baseStyle, {
      justify: options.justify ?? 'left',
      tabSize: this.tabSize,
      noWrap: !this.wordWrap,
    });
    if (this.stylizedRanges.length) {
      this.applyStylizedRanges(text);
    }
    if (lineRange && (lineRange[0] ?? lineRange[1])) {
      const [start, end] = lineRange;
      const lines = text.split('\n', { allowBlank: true })._lines;
      const startIndex = start != null ? Math.max(0, start - 1) : 0;
      const endIndex = end != null ? Math.min(lines.length, end) : lines.length;
      const selected = lines.slice(startIndex, endIndex);
      return new Text('\n').join(selected);
    }
    return text;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    if (this.hasPadding) {
      const contentRenderable = {
        __richConsole__: (c: Console, opts: ConsoleOptions): RenderResult =>
          this.getSyntax(c, opts),
        __richMeasure__: (c: Console, opts: ConsoleOptions): Measurement =>
          this.measureContent(c, opts),
      };
      const padding = new Padding(contentRenderable, this.padding, { style: this.getBaseStyle() });
      yield* padding.__richConsole__(console, options);
      return;
    }
    yield* this.getSyntax(console, options);
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    const contentMeasurement = this.measureContent(console, options);
    if (!this.hasPadding) {
      return contentMeasurement;
    }
    const [, padRight, , padLeft] = this.padding;
    const extra = padLeft + padRight;
    const minimum = Math.min(options.maxWidth, contentMeasurement.minimum + extra);
    const maximum = Math.min(options.maxWidth, contentMeasurement.maximum + extra);
    return new Measurement(minimum, maximum);
  }

  private get hasPadding(): boolean {
    return this.padding.some((value) => value > 0);
  }

  private *getSyntax(console: Console, options: ConsoleOptions): RenderResult {
    const transparentBackground = this.getBaseStyle().transparentBackground;
    const [, padRight, , padLeft] = this.padding;
    const horizontalPadding = padLeft + padRight;
    let codeWidth =
      this.codeWidth ??
      Math.max(
        1,
        options.maxWidth - horizontalPadding - (this.lineNumbers ? this.numbersColumnWidth + 1 : 0)
      );
    codeWidth = Math.max(1, codeWidth);

    const [endsWithNewline, processedCode] = this.processCode(this.code);
    let text = this.highlight(processedCode);
    const showIndentGuides = this.shouldShowIndentGuides(options);

    if (!this.lineNumbers && !this.wordWrap && !this.lineRange) {
      if (!endsWithNewline) {
        text.removeSuffix('\n');
      }
      if (showIndentGuides) {
        text = this.applyIndentGuides(text);
      }
      yield* console.render(text, options.update({ width: codeWidth }));
      return;
    }

    const [startLineRange] = this.lineRange ?? [null, null];
    const lineOffset = startLineRange ? Math.max(0, startLineRange - 1) : 0;
    const splitLines = text.split('\n', { allowBlank: endsWithNewline });
    const totalLines = splitLines._lines;
    if (this.lineRange && lineOffset >= totalLines.length) {
      return;
    }
    let lines: Text[] = totalLines;
    if (this.lineRange) {
      const [, endLineRange] = this.lineRange;
      const endIndex = endLineRange ? Math.min(lines.length, endLineRange) : lines.length;
      lines = lines.slice(lineOffset, endIndex);
    }
    if (lines.length === 0) {
      return;
    }
    if (showIndentGuides) {
      const joined = new Text('\n').join(lines);
      const guided = this.applyIndentGuides(joined);
      lines = guided.split('\n', { allowBlank: true })._lines;
    }

    const renderOptions = options.update({ width: codeWidth, height: undefined });
    const linePointer = options.legacyWindows ? '> ' : '❱ ';
    const highlightLine = (lineNumber: number) => this.highlightLines.has(lineNumber);
    const [backgroundStyle, numberStyle, highlightNumberStyle] = this.getNumberStyles(console);
    const newLineSegment = Segment.line();

    lines.forEach((line) => line.expandTabs(this.tabSize));

    let currentLineNumber = this.startLine + lineOffset;
    for (const line of lines) {
      const wrappedLines = this.wordWrap
        ? console.renderLines(line, renderOptions, backgroundStyle, !transparentBackground)
        : [
            Segment.adjustLineLength(
              Array.from(line.render(console, '')),
              Math.max(1, codeWidth),
              backgroundStyle,
              !transparentBackground
            ),
          ];

      if (this.lineNumbers) {
        const padSegment = new Segment(' '.repeat(this.numbersColumnWidth + 1), backgroundStyle);
        for (const [isFirst, wrapped] of loopFirst(wrappedLines)) {
          if (isFirst) {
            const numberColumn = `${String(currentLineNumber).padStart(
              Math.max(1, this.numbersColumnWidth - 2)
            )} `;
            if (highlightLine(currentLineNumber)) {
              yield new Segment(linePointer, new Style({ color: 'red' }));
              yield new Segment(numberColumn, highlightNumberStyle);
            } else {
              yield new Segment('  ', highlightNumberStyle);
              yield new Segment(numberColumn, numberStyle);
            }
          } else {
            yield padSegment;
          }
          yield* wrapped;
          yield newLineSegment;
        }
      } else {
        for (const wrapped of wrappedLines) {
          yield* wrapped;
          yield newLineSegment;
        }
      }
      currentLineNumber += 1;
    }
  }

  private measureContent(_console: Console, options: ConsoleOptions): Measurement {
    const [, padRight, , padLeft] = this.padding;
    const padding = padLeft + padRight;
    if (this.codeWidth !== undefined) {
      const width = this.codeWidth + this.numbersColumnWidth + padding + (this.lineNumbers ? 1 : 0);
      return new Measurement(this.numbersColumnWidth, width);
    }
    const lines = this.code.split(/\r?\n/);
    const maxLine = lines.length ? Math.max(...lines.map((line) => line.length)) : 0;
    const width = this.numbersColumnWidth + padding + maxLine + (this.lineNumbers ? 1 : 0);
    const clamped = Math.min(width, options.maxWidth);
    const minimum = Math.min(clamped, this.lineNumbers ? this.numbersColumnWidth : 0);
    return new Measurement(minimum, clamped);
  }

  private get numbersColumnWidth(): number {
    if (!this.lineNumbers) return 0;
    const totalLines = this.startLine + this.code.split('\n').length;
    return Math.max(
      NUMBERS_COLUMN_DEFAULT_PADDING,
      String(totalLines).length + NUMBERS_COLUMN_DEFAULT_PADDING
    );
  }

  private processCode(code: string): [boolean, string] {
    const endsOnNewline = code.endsWith('\n');
    let processed = endsOnNewline ? code : `${code}\n`;
    if (this.dedent) {
      const lines = processed.split('\n');
      const indentSizes = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => line.match(/^ +/)?.[0].length ?? 0);
      const minIndent = indentSizes.length ? Math.min(...indentSizes) : 0;
      if (minIndent > 0) {
        const indent = ' '.repeat(minIndent);
        processed = lines
          .map((line) => (line.startsWith(indent) ? line.slice(minIndent) : line))
          .join('\n');
      }
    }
    processed = processed.replace(/\t/g, ' '.repeat(this.tabSize));
    return [endsOnNewline, processed];
  }

  private getBaseStyle(): Style {
    return this.theme.getBackgroundStyle().add(this.backgroundStyle);
  }

  private getNumberStyles(console: Console): [Style, Style, Style] {
    const base = this.getBaseStyle();
    if (base.transparentBackground) {
      return [Style.null(), Style.null(), Style.null()];
    }
    const color = this.getLineNumbersColor();
    const numberColorStyle = color ? new Style({ color }) : Style.null();
    const numberStyle = Style.chain(base, new Style({ dim: true }), numberColorStyle);
    const highlightStyle = Style.chain(base, new Style({ bold: true }), numberColorStyle);
    if (console.colorSystem === 'standard') {
      return [base, base.add(new Style({ dim: true })), base];
    }
    return [base, numberStyle, highlightStyle];
  }

  private getLineNumbersColor(blend = 0.3): Color {
    const background = this.getBaseStyle().bgcolor;
    if (!background || background.isSystemDefined) {
      return Color.default();
    }
    const foreground = Color.default();
    const blended = blendRgb(background.getTruecolor(), foreground.getTruecolor(), blend);
    return Color.fromTriplet(blended);
  }

  private shouldShowIndentGuides(options: ConsoleOptions): boolean {
    return this.indentGuides && !options.asciiOnly;
  }

  private applyIndentGuides(text: Text): Text {
    const guided = text.withIndentGuides(this.tabSize, { style: this.getIndentGuideStyle() });
    guided.overflow = 'crop';
    return guided;
  }

  private getIndentGuideStyle(): Style {
    return this.getBaseStyle().add(new Style({ dim: true, italic: false }));
  }

  private applyStylizedRanges(text: Text): void {
    const code = text.plain;
    const newlineOffsets = [
      0,
      ...Array.from(code.matchAll(/\n/g)).map((match) => (match.index ?? 0) + 1),
      code.length + 1,
    ];

    for (const range of this.stylizedRanges) {
      const start = getCodeIndexForPosition(newlineOffsets, range.start);
      const end = getCodeIndexForPosition(newlineOffsets, range.end);
      if (start === null || end === null || end <= start) continue;
      if (range.styleBefore) {
        text.stylizeBefore(range.style, start, end);
      } else {
        text.stylize(range.style, start, end);
      }
    }
  }
}

function getCodeIndexForPosition(offsets: number[], position: SyntaxPosition): number | null {
  const [lineNumber, column] = position;
  if (lineNumber < 1 || lineNumber > offsets.length - 1) {
    return null;
  }
  const lineStart = offsets[lineNumber - 1];
  if (lineStart === undefined) {
    return null;
  }
  return lineStart + column;
}
