import type { AlignMethod } from './align.js';
import { Box, ROUNDED } from './box.js';
import { cellLen } from './cells.js';
import { ColorSystem } from './color.js';
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Measurement, measureRenderables } from './measure.js';
import { Padding, type PaddingDimensions } from './padding.js';
import { Segment } from './segment.js';
import { Style, type StyleType } from './style.js';
import { Text, type TextType } from './text.js';

/**
 * A console renderable that draws a border around its contents.
 *
 * @example
 * ```typescript
 * console.print(new Panel("Hello, World!"));
 * ```
 */
export class Panel {
  public readonly renderable: RenderableType;
  public readonly box: Box;
  public readonly title: TextType | undefined;
  public readonly titleAlign: AlignMethod;
  public readonly subtitle: TextType | undefined;
  public readonly subtitleAlign: AlignMethod;
  public readonly safeBox: boolean | undefined;
  public readonly expand: boolean;
  public readonly style: StyleType;
  public readonly borderStyle: StyleType;
  public readonly width: number | undefined;
  public readonly height: number | undefined;
  public readonly padding: PaddingDimensions;
  public readonly highlight: boolean;

  constructor(
    renderable: RenderableType,
    box: Box = ROUNDED,
    options: {
      title?: TextType;
      titleAlign?: AlignMethod;
      subtitle?: TextType;
      subtitleAlign?: AlignMethod;
      safeBox?: boolean;
      expand?: boolean;
      style?: StyleType;
      borderStyle?: StyleType;
      width?: number;
      height?: number;
      padding?: PaddingDimensions;
      highlight?: boolean;
    } = {}
  ) {
    this.renderable = renderable;
    this.box = box;
    this.title = options.title;
    this.titleAlign = options.titleAlign ?? 'center';
    this.subtitle = options.subtitle;
    this.subtitleAlign = options.subtitleAlign ?? 'center';
    this.safeBox = options.safeBox;
    this.expand = options.expand ?? true;
    this.style = options.style ?? 'none';
    this.borderStyle = options.borderStyle ?? 'none';
    this.width = options.width;
    this.height = options.height;
    this.padding = options.padding ?? [0, 1];
    this.highlight = options.highlight ?? false;
  }

  /**
   * An alternative constructor that sets expand=False.
   */
  static fit(
    renderable: RenderableType,
    box: Box = ROUNDED,
    options: {
      title?: TextType;
      titleAlign?: AlignMethod;
      subtitle?: TextType;
      subtitleAlign?: AlignMethod;
      safeBox?: boolean;
      style?: StyleType;
      borderStyle?: StyleType;
      width?: number;
      height?: number;
      padding?: PaddingDimensions;
      highlight?: boolean;
    } = {}
  ): Panel {
    return new Panel(renderable, box, { ...options, expand: false });
  }

  private get _title(): Text | undefined {
    if (this.title) {
      const titleText =
        typeof this.title === 'string'
          ? Text.fromMarkup(this.title)
          : this.title.copy
            ? this.title.copy()
            : this.title;
      titleText.end = '';
      titleText.plain = titleText.plain.replace(/\n/g, ' ');
      titleText.noWrap = true;
      titleText.expandTabs();
      titleText.pad(1);
      return titleText;
    }
    return undefined;
  }

  private get _subtitle(): Text | undefined {
    if (this.subtitle) {
      const subtitleText =
        typeof this.subtitle === 'string'
          ? Text.fromMarkup(this.subtitle)
          : this.subtitle.copy
            ? this.subtitle.copy()
            : this.subtitle;
      subtitleText.end = '';
      subtitleText.plain = subtitleText.plain.replace(/\n/g, ' ');
      subtitleText.noWrap = true;
      subtitleText.expandTabs();
      subtitleText.pad(1);
      return subtitleText;
    }
    return undefined;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const _padding = Padding.unpack(this.padding);
    const renderable = _padding.some((p) => p > 0)
      ? new Padding(this.renderable, _padding)
      : this.renderable;

    const style = this.style === 'none' ? Style.null() : console.getStyle(this.style);
    const borderStyle = style.add(console.getStyle(this.borderStyle));
    const width =
      this.width === undefined ? options.maxWidth : Math.min(options.maxWidth, this.width);

    const safeBox = this.safeBox ?? console.options.safeBox ?? false;
    const box = this.box.substitute(options, safeBox);

    const alignText = (
      text: Text,
      width: number,
      align: string,
      character: string,
      style: Style
    ): Text => {
      const textCopy = text.copy ? text.copy() : text;
      textCopy.truncate(width);
      const excessSpace = width - cellLen(textCopy.plain);
      if (textCopy.style) {
        textCopy.stylize(console.getStyle(textCopy.style));
      }

      if (excessSpace) {
        if (align === 'left') {
          return Text.assemble(textCopy, [character.repeat(excessSpace), style], {
            noWrap: true,
            end: '',
          });
        } else if (align === 'center') {
          const left = Math.floor(excessSpace / 2);
          return Text.assemble(
            [character.repeat(left), style],
            textCopy,
            [character.repeat(excessSpace - left), style],
            { noWrap: true, end: '' }
          );
        } else {
          return Text.assemble([character.repeat(excessSpace), style], textCopy, {
            noWrap: true,
            end: '',
          });
        }
      }
      return textCopy;
    };

    const titleText = this._title;
    if (titleText) {
      titleText.stylizeBefore(borderStyle);
    }

    let childWidth = this.expand
      ? width - 2
      : console.measure(renderable, options.updateWidth(width - 2)).maximum;

    let childHeight = this.height ?? options.height ?? undefined;
    if (childHeight !== undefined) {
      childHeight -= 2;
    }

    if (titleText) {
      childWidth = Math.min(options.maxWidth - 2, Math.max(childWidth, titleText.cellLen + 2));
    }

    const panelWidth = childWidth + 2;
    const childOptions = options.update({
      width: childWidth,
      height: childHeight,
      highlight: this.highlight,
    });
    // Pass style to renderLines so padding segments get Style objects
    const lines = console.renderLines(renderable, childOptions, style);

    // Pad lines to childHeight if specified
    if (childHeight !== undefined && lines.length < childHeight) {
      // Create blank line matching the structure of content lines with padding
      const [, right, , left] = Padding.unpack(this.padding);
      const contentWidth = childWidth - left - right;
      const blankLine = [];
      if (left > 0) {
        blankLine.push(new Segment(' '.repeat(left), style ?? Style.null()));
      }
      if (contentWidth > 0) {
        blankLine.push(new Segment(' '.repeat(contentWidth), style ?? Style.null()));
      }
      if (right > 0) {
        blankLine.push(new Segment(' '.repeat(right), style ?? Style.null()));
      }
      while (lines.length < childHeight) {
        lines.push(blankLine);
      }
    }

    const lineStart = new Segment(box.midLeft, borderStyle);
    const lineEnd = new Segment(box.midRight, borderStyle);
    const newLine = Segment.line();

    // Top border
    if (!titleText || panelWidth <= 4) {
      yield new Segment(box.getTop([panelWidth - 2]), borderStyle);
    } else {
      const alignedTitle = alignText(
        titleText,
        panelWidth - 4,
        this.titleAlign,
        box.top,
        borderStyle
      );
      yield new Segment(box.topLeft + box.top, borderStyle);
      // Render title to segments and merge into a single text string with ANSI codes
      const titleSegments = alignedTitle.render(console, '');
      const titleStr = titleSegments
        .map((seg) => {
          if (seg.style && !seg.style.isNull) {
            return seg.style.render(seg.text, ColorSystem.TRUECOLOR);
          }
          return seg.text;
        })
        .join('');
      yield new Segment(titleStr);
      yield new Segment(box.top + box.topRight, borderStyle);
    }
    yield newLine;

    // Content lines
    for (const line of lines) {
      yield lineStart;
      yield* line;
      yield lineEnd;
      yield newLine;
    }

    // Bottom border
    const subtitleText = this._subtitle;
    if (subtitleText) {
      subtitleText.stylizeBefore(borderStyle);
    }

    if (!subtitleText || panelWidth <= 4) {
      yield new Segment(box.getBottom([panelWidth - 2]), borderStyle);
    } else {
      const alignedSubtitle = alignText(
        subtitleText,
        panelWidth - 4,
        this.subtitleAlign,
        box.bottom,
        borderStyle
      );
      yield new Segment(box.bottomLeft + box.bottom, borderStyle);
      // Render subtitle to segments and merge into a single text string with ANSI codes
      const subtitleSegments = alignedSubtitle.render(console, '');
      const subtitleTextStr = subtitleSegments
        .map((seg) => {
          if (seg.style && !seg.style.isNull) {
            return seg.style.render(seg.text, ColorSystem.TRUECOLOR);
          }
          return seg.text;
        })
        .join('');
      yield new Segment(subtitleTextStr);
      yield new Segment(box.bottom + box.bottomRight, borderStyle);
    }
    yield newLine;
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    const _title = this._title;
    const [, right, , left] = Padding.unpack(this.padding);
    const padding = left + right;
    const renderables = _title ? [this.renderable, _title] : [this.renderable];

    if (this.width === undefined) {
      const measuredWidth =
        measureRenderables(
          console,
          options.updateWidth(options.maxWidth - padding - 2),
          renderables
        ).maximum +
        padding +
        2;
      return new Measurement(measuredWidth, measuredWidth);
    } else {
      return new Measurement(this.width, this.width);
    }
  }
}
