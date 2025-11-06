/**
 * Tables - Render data in columns with optional headers/footers.
 * Based on rich/table.py
 */

/* eslint-disable @typescript-eslint/no-this-alias */

import type {
  Console,
  ConsoleOptions,
  JustifyMethod,
  OverflowMethod,
  RenderableType,
  RenderResult,
} from './console.js';
import type { VerticalAlignMethod } from './align.js';
import * as box from './box.js';
import { NotRenderableError } from './errors.js';
import { loopFirstLast, loopLast } from './_loop.js';
import { pickBool } from './_pick.js';
import { ratioDistribute, ratioReduce } from './_ratio.js';
import { Measurement } from './measure.js';
import { Padding, PaddingDimensions } from './padding.js';
import { isRenderable } from './protocol.js';
import { Segment } from './segment.js';
import { Style, StyleType } from './style.js';
import { Text, TextType } from './text.js';

/**
 * Defines a column within a Table.
 */
export interface Column {
  /** Renderable for the header (typically a string) */
  header: RenderableType;
  /** Renderable for the footer (typically a string) */
  footer: RenderableType;
  /** The style of the header */
  headerStyle: StyleType;
  /** The style of the footer */
  footerStyle: StyleType;
  /** The style of the column */
  style: StyleType;
  /** How to justify text within the column ("left", "center", "right", or "full") */
  justify: JustifyMethod;
  /** How to vertically align content ("top", "middle", or "bottom") */
  vertical: VerticalAlignMethod;
  /** Overflow method */
  overflow: OverflowMethod;
  /** Width of the column, or undefined to auto calculate width */
  width?: number;
  /** Minimum width of column, or undefined for no minimum */
  minWidth?: number;
  /** Maximum width of column, or undefined for no maximum */
  maxWidth?: number;
  /** Ratio to use when calculating column width, or undefined to adapt to column contents */
  ratio?: number;
  /** Prevent wrapping of text within the column */
  noWrap: boolean;
  /** Apply highlighter to column */
  highlight: boolean;
  /** Index of column */
  _index: number;
  /** Cell data */
  _cells: RenderableType[];
}

/**
 * Information regarding a row.
 */
export interface Row {
  /** Style to apply to row */
  style?: StyleType;
  /** Indicates end of section, which will force a line beneath the row */
  endSection: boolean;
}

/**
 * A single cell in a table.
 */
export interface _Cell {
  /** Style to apply to cell */
  style: StyleType;
  /** Cell renderable */
  renderable: RenderableType;
  /** Cell vertical alignment */
  vertical: VerticalAlignMethod;
}

/**
 * Options for creating a Column.
 */
export interface ColumnOptions {
  header?: RenderableType;
  footer?: RenderableType;
  headerStyle?: StyleType;
  footerStyle?: StyleType;
  style?: StyleType;
  justify?: JustifyMethod;
  vertical?: VerticalAlignMethod;
  overflow?: OverflowMethod;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  ratio?: number;
  noWrap?: boolean;
  highlight?: boolean;
}

/**
 * Create a new Column.
 */
export function createColumn(index: number, options: ColumnOptions = {}): Column {
  return {
    header: options.header ?? '',
    footer: options.footer ?? '',
    headerStyle: options.headerStyle ?? '',
    footerStyle: options.footerStyle ?? '',
    style: options.style ?? '',
    justify: options.justify ?? 'left',
    vertical: options.vertical ?? 'top',
    overflow: options.overflow ?? 'ellipsis',
    width: options.width,
    minWidth: options.minWidth,
    maxWidth: options.maxWidth,
    ratio: options.ratio,
    noWrap: options.noWrap ?? false,
    highlight: options.highlight ?? false,
    _index: index,
    _cells: [],
  };
}

/**
 * Copy a column without its cells.
 */
export function copyColumn(column: Column): Column {
  return {
    ...column,
    _cells: [],
  };
}

/**
 * Check if a column is flexible (has a ratio).
 */
export function isFlexibleColumn(column: Column): boolean {
  return column.ratio !== undefined;
}

/**
 * Get all cells in a column, not including header.
 */
export function* columnCells(column: Column): Generator<RenderableType> {
  yield* column._cells;
}

/**
 * A console renderable to draw a table.
 */
export class Table {
  // eslint-disable-line @typescript-eslint/no-this-alias
  public columns: Column[] = [];
  public rows: Row[] = [];
  public title?: TextType;
  public caption?: TextType;
  public width?: number;
  public minWidth?: number;
  public box?: box.Box;
  public safeBox?: boolean;
  private _padding: [number, number, number, number];
  public padEdge: boolean;
  private _expand: boolean;
  public showHeader: boolean;
  public showFooter: boolean;
  public showEdge: boolean;
  public showLines: boolean;
  public leading: number;
  public collapsePadding: boolean;
  public style: StyleType;
  public headerStyle: StyleType;
  public footerStyle: StyleType;
  public borderStyle?: StyleType;
  public titleStyle?: StyleType;
  public captionStyle?: StyleType;
  public titleJustify: JustifyMethod;
  public captionJustify: JustifyMethod;
  public highlight: boolean;
  public rowStyles: StyleType[];

  /**
   * Create a new Table.
   *
   * @param headers - Column headers, either as strings or Column instances.
   * @param options - Table options.
   */
  constructor(
    ...args: Array<
      | Column
      | string
      | {
          title?: TextType;
          caption?: TextType;
          width?: number;
          minWidth?: number;
          box?: box.Box;
          safeBox?: boolean;
          padding?: PaddingDimensions;
          collapsePadding?: boolean;
          padEdge?: boolean;
          expand?: boolean;
          showHeader?: boolean;
          showFooter?: boolean;
          showEdge?: boolean;
          showLines?: boolean;
          leading?: number;
          style?: StyleType;
          rowStyles?: StyleType[];
          headerStyle?: StyleType;
          footerStyle?: StyleType;
          borderStyle?: StyleType;
          titleStyle?: StyleType;
          captionStyle?: StyleType;
          titleJustify?: JustifyMethod;
          captionJustify?: JustifyMethod;
          highlight?: boolean;
        }
    >
  ) {
    // Separate headers from options
    const headers: Array<Column | string> = [];
    let options: Record<string, unknown> = {};

    for (const arg of args) {
      if (typeof arg === 'string' || (typeof arg === 'object' && '_index' in arg)) {
        headers.push(arg);
      } else if (typeof arg === 'object') {
        options = arg;
      }
    }

    // Initialize properties
    this.title = options.title as TextType | undefined;
    this.caption = options.caption as TextType | undefined;
    this.width = options.width as number | undefined;
    this.minWidth = options.minWidth as number | undefined;
    // Special handling: null means no box, undefined means default box
    this.box =
      options.box !== undefined
        ? options.box === null
          ? undefined
          : (options.box as box.Box)
        : box.HEAVY_HEAD;
    this.safeBox = options.safeBox as boolean | undefined;
    this._padding = Padding.unpack((options.padding ?? [0, 1]) as PaddingDimensions);
    this.padEdge = (options.padEdge ?? true) as boolean;
    this._expand = (options.expand ?? false) as boolean;
    this.showHeader = (options.showHeader ?? true) as boolean;
    this.showFooter = (options.showFooter ?? false) as boolean;
    this.showEdge = (options.showEdge ?? true) as boolean;
    this.showLines = (options.showLines ?? false) as boolean;
    this.leading = (options.leading ?? 0) as number;
    this.collapsePadding = (options.collapsePadding ?? false) as boolean;
    this.style = (options.style ?? 'none') as StyleType;
    this.headerStyle = (options.headerStyle ?? 'table.header') as StyleType;
    this.footerStyle = (options.footerStyle ?? 'table.footer') as StyleType;
    this.borderStyle = options.borderStyle as StyleType | undefined;
    this.titleStyle = options.titleStyle as StyleType | undefined;
    this.captionStyle = options.captionStyle as StyleType | undefined;
    this.titleJustify = (options.titleJustify ?? 'center') as JustifyMethod;
    this.captionJustify = (options.captionJustify ?? 'center') as JustifyMethod;
    this.highlight = (options.highlight ?? false) as boolean;
    this.rowStyles = (Array.isArray(options.rowStyles) ? options.rowStyles : []) as StyleType[];

    // Add headers
    for (const header of headers) {
      if (typeof header === 'string') {
        this.addColumn(header);
      } else {
        header._index = this.columns.length;
        this.columns.push(header);
      }
    }
  }

  /**
   * Get a table with no lines, headers, or footer.
   *
   * @param headers - Column headers, either as strings or Column instances.
   * @param options - Grid options.
   * @returns A table instance configured as a grid.
   */
  static grid(
    ...args: Array<
      | Column
      | string
      | {
          padding?: PaddingDimensions;
          collapsePadding?: boolean;
          padEdge?: boolean;
          expand?: boolean;
        }
    >
  ): Table {
    // Separate headers from options
    const headers: Array<Column | string> = [];
    let options: Record<string, unknown> = {};

    for (const arg of args) {
      if (typeof arg === 'string' || (typeof arg === 'object' && '_index' in arg)) {
        headers.push(arg);
      } else if (typeof arg === 'object') {
        options = arg;
      }
    }

    return new Table(...headers, {
      box: null as unknown as box.Box,
      padding: (options.padding ?? 0) as PaddingDimensions,
      collapsePadding: (options.collapsePadding ?? true) as boolean,
      showHeader: false,
      showFooter: false,
      showEdge: false,
      padEdge: (options.padEdge ?? false) as boolean,
      expand: (options.expand ?? false) as boolean,
    });
  }

  /**
   * Setting a non-undefined width implies expand.
   */
  get expand(): boolean {
    return this._expand || this.width !== undefined;
  }

  set expand(expand: boolean) {
    this._expand = expand;
  }

  /**
   * Get extra width to add to cell content.
   */
  private get _extraWidth(): number {
    let width = 0;
    if (this.box && this.showEdge) {
      width += 2;
    }
    if (this.box) {
      width += this.columns.length - 1;
    }
    return width;
  }

  /**
   * Get the current number of rows.
   */
  get rowCount(): number {
    return this.rows.length;
  }

  /**
   * Get cell padding.
   */
  get padding(): [number, number, number, number] {
    return this._padding;
  }

  /**
   * Set cell padding.
   */
  set padding(padding: PaddingDimensions) {
    this._padding = Padding.unpack(padding);
  }

  /**
   * Get the current row style.
   */
  getRowStyle(console: Console, index: number): StyleType {
    let style = Style.null();
    if (this.rowStyles.length > 0) {
      style = style.add(console.getStyle(this.rowStyles[index % this.rowStyles.length]!));
    }
    const rowStyle = this.rows[index]?.style;
    if (rowStyle !== undefined) {
      style = style.add(console.getStyle(rowStyle));
    }
    return style;
  }

  /**
   * Add a column to the table.
   */
  addColumn(
    header: RenderableType = '',
    footer: RenderableType = '',
    options: Omit<ColumnOptions, 'header' | 'footer'> & { highlight?: boolean } = {}
  ): void {
    const column = createColumn(this.columns.length, {
      header,
      footer,
      headerStyle: options.headerStyle ?? '',
      footerStyle: options.footerStyle ?? '',
      style: options.style ?? '',
      justify: options.justify ?? 'left',
      vertical: options.vertical ?? 'top',
      overflow: options.overflow ?? 'ellipsis',
      width: options.width,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      ratio: options.ratio,
      noWrap: options.noWrap ?? false,
      highlight: options.highlight ?? this.highlight,
    });
    this.columns.push(column);
  }

  /**
   * Add a row of renderables.
   *
   * @param renderables - Each cell in a row must be a renderable object (including string), or undefined for a blank cell.
   * @param options - Row options.
   */
  addRow(
    ...args: Array<RenderableType | undefined | { style?: StyleType; endSection?: boolean }>
  ): void {
    // Separate renderables from options
    const renderables: Array<RenderableType | undefined> = [];
    let options: { style?: StyleType; endSection?: boolean } = {};

    for (const arg of args) {
      if (
        arg !== undefined &&
        typeof arg === 'object' &&
        !isRenderable(arg) &&
        ('style' in arg || 'endSection' in arg)
      ) {
        options = arg as { style?: StyleType; endSection?: boolean };
      } else {
        renderables.push(arg as RenderableType | undefined);
      }
    }

    const addCell = (column: Column, renderable: RenderableType): void => {
      column._cells.push(renderable);
    };

    const cellRenderables = [...renderables];

    // Pad with empty cells if needed
    const columns = this.columns;
    if (cellRenderables.length < columns.length) {
      cellRenderables.push(
        ...(Array(columns.length - cellRenderables.length).fill(undefined) as (
          | RenderableType
          | undefined
        )[])
      );
    }

    for (let index = 0; index < cellRenderables.length; index++) {
      let column: Column;
      if (index >= columns.length) {
        // Create new column
        column = createColumn(index, { highlight: this.highlight });
        // Add empty cells for existing rows
        for (let i = 0; i < this.rows.length; i++) {
          addCell(column, new Text(''));
        }
        this.columns.push(column);
      } else {
        column = columns[index]!;
      }

      const renderable = cellRenderables[index];
      if (renderable === undefined) {
        addCell(column, '');
      } else if (isRenderable(renderable)) {
        addCell(column, renderable);
      } else {
        throw new NotRenderableError(
          `unable to render ${typeof renderable}; a string or other renderable object is required`
        );
      }
    }

    this.rows.push({
      style: options.style,
      endSection: options.endSection ?? false,
    });
  }

  /**
   * Add a new section (draw a line after current row).
   */
  addSection(): void {
    if (this.rows.length > 0) {
      this.rows[this.rows.length - 1]!.endSection = true;
    }
  }

  /**
   * Rich measure protocol.
   */
  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    let maxWidth = options.maxWidth;
    if (this.width !== undefined) {
      maxWidth = this.width;
    }
    if (maxWidth < 0) {
      return new Measurement(0, 0);
    }

    const extraWidth = this._extraWidth;
    maxWidth = this._calculateColumnWidths(
      console,
      options.updateWidth(maxWidth - extraWidth)
    ).reduce((sum, w) => sum + w, 0);

    const measurements = this.columns.map((column) =>
      this._measureColumn(console, options.updateWidth(maxWidth), column)
    );

    const minimumWidth = measurements.reduce((sum, m) => sum + m.minimum, 0) + extraWidth;
    const maximumWidth =
      this.width ?? measurements.reduce((sum, m) => sum + m.maximum, 0) + extraWidth;

    let measurement = new Measurement(minimumWidth, maximumWidth);
    measurement = measurement.clamp(this.minWidth);
    return measurement;
  }

  /**
   * Rich console rendering protocol.
   */
  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    if (this.columns.length === 0) {
      yield new Segment('\n');
      return;
    }

    let maxWidth = options.maxWidth;
    if (this.width !== undefined) {
      maxWidth = this.width;
    }

    const extraWidth = this._extraWidth;
    const widths = this._calculateColumnWidths(console, options.updateWidth(maxWidth - extraWidth));
    const tableWidth = widths.reduce((sum, w) => sum + w, 0) + extraWidth;

    const renderOptions = options.update({
      width: tableWidth,
      highlight: this.highlight,
      height: undefined,
    });

    const renderAnnotation = function* (
      text: TextType,
      style: StyleType,
      justify: JustifyMethod = 'center'
    ): RenderResult {
      const renderText =
        typeof text === 'string' ? console.renderStr(text, { style, highlight: false }) : text;

      // Set justify on Text object if not already set
      if (
        renderText &&
        typeof renderText === 'object' &&
        'justify' in renderText &&
        !renderText.justify
      ) {
        renderText.justify = justify;
      }

      yield* console.render(renderText, renderOptions);
    };

    if (this.title) {
      yield* renderAnnotation(
        this.title,
        Style.pickFirst(this.titleStyle, 'table.title'),
        this.titleJustify
      );
    }

    yield* this._render(console, renderOptions, widths);

    if (this.caption) {
      yield* renderAnnotation(
        this.caption,
        Style.pickFirst(this.captionStyle, 'table.caption'),
        this.captionJustify
      );
    }
  }

  /**
   * Calculate the widths of each column, including padding, not including borders.
   */
  private _calculateColumnWidths(console: Console, options: ConsoleOptions): number[] {
    const maxWidth = options.maxWidth;
    const columns = this.columns;
    const widthRanges = columns.map((column) => this._measureColumn(console, options, column));
    let widths = widthRanges.map((range) => range.maximum ?? 1);
    const getPaddingWidth = (columnIndex: number) => this._getPaddingWidth(columnIndex);
    const extraWidth = this._extraWidth;

    if (this.expand) {
      const ratios = columns.filter(isFlexibleColumn).map((col) => col.ratio ?? 0);
      if (ratios.some((r) => r > 0)) {
        const fixedWidths = widthRanges.map((range, i) =>
          isFlexibleColumn(columns[i]!) ? 0 : range.maximum
        );
        const flexMinimum = columns
          .filter(isFlexibleColumn)
          .map((column) => (column.width ?? 1) + getPaddingWidth(column._index));
        const flexibleWidth = maxWidth - fixedWidths.reduce((sum, w) => sum + w, 0);
        const flexWidths = ratioDistribute(flexibleWidth, ratios, flexMinimum);
        const iterFlexWidths = flexWidths[Symbol.iterator]();
        for (let index = 0; index < columns.length; index++) {
          if (isFlexibleColumn(columns[index]!)) {
            widths[index] = fixedWidths[index]! + (iterFlexWidths.next().value as number);
          }
        }
      }
    }

    let tableWidth = widths.reduce((sum, w) => sum + w, 0);

    if (tableWidth > maxWidth) {
      widths = Table._collapseWidths(
        widths,
        columns.map((column) => column.width === undefined && !column.noWrap),
        maxWidth
      );
      tableWidth = widths.reduce((sum, w) => sum + w, 0);

      // Last resort, reduce columns evenly
      if (tableWidth > maxWidth) {
        const excessWidth = tableWidth - maxWidth;
        widths = ratioReduce(excessWidth, Array(widths.length).fill(1) as number[], widths, widths);
        tableWidth = widths.reduce((sum, w) => sum + w, 0);
      }

      const updatedWidthRanges = widths.map((width, i) =>
        this._measureColumn(console, options.updateWidth(width), columns[i]!)
      );
      widths = updatedWidthRanges.map((range) => range.maximum ?? 0);
    }

    if (
      (tableWidth < maxWidth && this.expand) ||
      (this.minWidth !== undefined && tableWidth < this.minWidth - extraWidth)
    ) {
      const _maxWidth =
        this.minWidth === undefined ? maxWidth : Math.min(this.minWidth - extraWidth, maxWidth);
      const padWidths = ratioDistribute(_maxWidth - tableWidth, widths);
      widths = widths.map((w, i) => w + padWidths[i]!);
    }

    return widths;
  }

  /**
   * Reduce widths so that the total is under maxWidth.
   */
  private static _collapseWidths(
    widths: number[],
    wrapable: boolean[],
    maxWidth: number
  ): number[] {
    let totalWidth = widths.reduce((sum, w) => sum + w, 0);
    let excessWidth = totalWidth - maxWidth;

    if (wrapable.some((w) => w)) {
      while (totalWidth && excessWidth > 0) {
        const maxColumn = Math.max(...widths.map((w, i) => (wrapable[i] ? w : 0)));
        const secondMaxColumn = Math.max(
          ...widths.map((w, i) => (wrapable[i] && w !== maxColumn ? w : 0))
        );
        const columnDifference = maxColumn - secondMaxColumn;
        const ratios = widths.map((w, i) => (w === maxColumn && wrapable[i] ? 1 : 0));

        if (!ratios.some((r) => r > 0) || columnDifference === 0) {
          break;
        }

        const maxReduce = Array(widths.length).fill(
          Math.min(excessWidth, columnDifference)
        ) as number[];
        widths = ratioReduce(excessWidth, ratios, maxReduce, widths);

        totalWidth = widths.reduce((sum, w) => sum + w, 0);
        excessWidth = totalWidth - maxWidth;
      }
    }

    return widths;
  }

  /**
   * Get all the cells with padding and optional header.
   */
  private *_getCells(console: Console, columnIndex: number, column: Column): Generator<_Cell> {
    const collapsePadding = this.collapsePadding;
    const padEdge = this.padEdge;
    const padding = this.padding;
    const anyPadding = padding.some((p) => p > 0);

    const firstColumn = columnIndex === 0;
    const lastColumn = columnIndex === this.columns.length - 1;

    const paddingCache = new Map<string, [number, number, number, number]>();

    const getPadding = (firstRow: boolean, lastRow: boolean): [number, number, number, number] => {
      const key = `${firstRow}-${lastRow}`;
      const cached = paddingCache.get(key);
      if (cached) {
        return cached;
      }

      let [top, right, bottom, left] = padding;

      if (collapsePadding) {
        if (!firstColumn) {
          left = Math.max(0, left - right);
        }
        if (!lastRow) {
          bottom = Math.max(0, top - bottom);
        }
      }

      if (!padEdge) {
        if (firstColumn) {
          left = 0;
        }
        if (lastColumn) {
          right = 0;
        }
        if (firstRow) {
          top = 0;
        }
        if (lastRow) {
          bottom = 0;
        }
      }

      const result: [number, number, number, number] = [top, right, bottom, left];
      paddingCache.set(key, result);
      return result;
    };

    const rawCells: Array<[StyleType, RenderableType]> = [];
    const getStyle = (style: StyleType) => console.getStyle(style);

    if (this.showHeader) {
      const headerStyle = getStyle(this.headerStyle ?? '').add(getStyle(column.headerStyle));
      rawCells.push([headerStyle, column.header]);
    }

    const cellStyle = getStyle(column.style ?? '');
    for (const cell of columnCells(column)) {
      rawCells.push([cellStyle, cell]);
    }

    if (this.showFooter) {
      const footerStyle = getStyle(this.footerStyle ?? '').add(getStyle(column.footerStyle));
      rawCells.push([footerStyle, column.footer]);
    }

    if (anyPadding) {
      for (const [first, last, [style, renderable]] of loopFirstLast(rawCells)) {
        const vertical =
          (renderable && typeof renderable === 'object' && 'vertical' in renderable
            ? (renderable as { vertical?: VerticalAlignMethod }).vertical
            : undefined) ?? column.vertical;
        yield {
          style,
          renderable: new Padding(renderable, getPadding(first, last)),
          vertical,
        };
      }
    } else {
      for (const [style, renderable] of rawCells) {
        const vertical =
          (renderable && typeof renderable === 'object' && 'vertical' in renderable
            ? (renderable as { vertical?: VerticalAlignMethod }).vertical
            : undefined) ?? column.vertical;
        yield {
          style,
          renderable,
          vertical,
        };
      }
    }
  }

  /**
   * Get extra width from padding.
   */
  private _getPaddingWidth(columnIndex: number): number {
    const [, padRight, , padLeft] = this.padding;
    let left = padLeft;
    if (this.collapsePadding && columnIndex > 0) {
      left = Math.max(0, padLeft - padRight);
    }
    return left + padRight;
  }

  /**
   * Get the minimum and maximum width of the column.
   */
  private _measureColumn(console: Console, options: ConsoleOptions, column: Column): Measurement {
    const maxWidth = options.maxWidth;
    if (maxWidth < 1) {
      return new Measurement(0, 0);
    }

    const paddingWidth = this._getPaddingWidth(column._index);

    if (column.width !== undefined) {
      // Fixed width column
      return new Measurement(column.width + paddingWidth, column.width + paddingWidth).withMaximum(
        maxWidth
      );
    }

    // Flexible column, we need to measure contents
    const minWidths: number[] = [];
    const maxWidths: number[] = [];

    for (const cell of this._getCells(console, column._index, column)) {
      const { minimum: _min, maximum: _max } = Measurement.get(console, options, cell.renderable);
      minWidths.push(_min);
      maxWidths.push(_max);
    }

    let measurement = new Measurement(
      minWidths.length > 0 ? Math.max(...minWidths) : 1,
      maxWidths.length > 0 ? Math.max(...maxWidths) : maxWidth
    ).withMaximum(maxWidth);

    measurement = measurement.clamp(
      column.minWidth !== undefined ? column.minWidth + paddingWidth : undefined,
      column.maxWidth !== undefined ? column.maxWidth + paddingWidth : undefined
    );

    return measurement;
  }

  /**
   * Render the table.
   */
  private *_render(console: Console, options: ConsoleOptions, widths: number[]): RenderResult {
    const tableStyle = console.getStyle(this.style ?? '');
    const borderStyle = tableStyle.add(console.getStyle(this.borderStyle ?? ''));

    const _columnCells = this.columns.map((column, index) =>
      Array.from(this._getCells(console, index, column))
    );

    const rowCells: _Cell[][] = [];
    const maxRows = Math.max(..._columnCells.map((cells) => cells.length));
    for (let i = 0; i < maxRows; i++) {
      rowCells.push(_columnCells.map((cells) => cells[i]!));
    }

    let _box = this.box
      ? this.box.substitute(options, pickBool(this.safeBox, options.safeBox))
      : undefined;
    _box = _box && !this.showHeader ? _box.getPlainHeadedBox() : _box;

    const newLine = Segment.line();

    const columns = this.columns;
    const showHeader = this.showHeader;
    const showFooter = this.showFooter;
    const showEdge = this.showEdge;
    const showLines = this.showLines;
    const leading = this.leading;

    if (_box) {
      const boxSegments: Array<[Segment, Segment, Segment]> = [
        [
          new Segment(_box.headLeft, borderStyle),
          new Segment(_box.headRight, borderStyle),
          new Segment(_box.headVertical, borderStyle),
        ],
        [
          new Segment(_box.midLeft, borderStyle),
          new Segment(_box.midRight, borderStyle),
          new Segment(_box.midVertical, borderStyle),
        ],
        [
          new Segment(_box.footLeft, borderStyle),
          new Segment(_box.footRight, borderStyle),
          new Segment(_box.footVertical, borderStyle),
        ],
      ];

      if (showEdge) {
        yield new Segment(_box.getTop(widths), borderStyle);
        yield newLine;
      }

      const getRowStyle = (console: Console, index: number) => this.getRowStyle(console, index);
      const getStyle = (style: StyleType) => console.getStyle(style);

      for (const [index, [first, last, rowCell]] of Array.from(loopFirstLast(rowCells)).entries()) {
        const headerRow = first && showHeader;
        const footerRow = last && showFooter;
        const row = !headerRow && !footerRow ? this.rows[index - (showHeader ? 1 : 0)] : undefined;

        let maxHeight = 1;
        const cells: Segment[][][] = [];
        const rowStyle =
          headerRow || footerRow
            ? Style.null()
            : getStyle(getRowStyle(console, index - (showHeader ? 1 : 0)));

        for (let i = 0; i < widths.length; i++) {
          const width = widths[i]!;
          const cell = rowCell[i]!;
          const column = columns[i]!;

          const renderOptions = options.update({
            width,
            height: undefined,
            highlight: column.highlight,
          });

          // Apply column settings to renderable if it's a Text object
          const cellRenderable = cell.renderable;
          if (cellRenderable && typeof cellRenderable === 'object' && 'justify' in cellRenderable) {
            if (!cellRenderable.justify) cellRenderable.justify = column.justify;
            if (cellRenderable.noWrap === undefined) cellRenderable.noWrap = column.noWrap;
            if (!cellRenderable.overflow) cellRenderable.overflow = column.overflow;
          }

          const lines = console.renderLines(
            cellRenderable,
            renderOptions,
            getStyle(cell.style).add(rowStyle)
          );
          maxHeight = Math.max(maxHeight, lines.length);
          cells.push(lines);
        }

        const rowHeight = Math.max(...cells.map((cell) => cell.length));

        const alignCell = (
          cell: Segment[][],
          vertical: VerticalAlignMethod,
          width: number,
          style: Style
        ): Segment[][] => {
          let alignMethod = vertical;
          if (headerRow) {
            alignMethod = 'bottom';
          } else if (footerRow) {
            alignMethod = 'top';
          }

          if (alignMethod === 'top') {
            return Segment.alignTop(cell, width, rowHeight, style);
          } else if (alignMethod === 'middle') {
            return Segment.alignMiddle(cell, width, rowHeight, style);
          }
          return Segment.alignBottom(cell, width, rowHeight, style);
        };

        const alignedCells = cells.map((cell, i) => {
          const _cell = rowCell[i]!;
          const width = widths[i]!;
          const style = getStyle(_cell.style).add(rowStyle);
          return Segment.setShape(alignCell(cell, _cell.vertical, width, style), width, maxHeight);
        });

        const [left, right, _divider] = boxSegments[first ? 0 : last ? 2 : 1]!;

        // If the column divider is whitespace also style it with the row background
        const divider = _divider.text.trim()
          ? _divider
          : new Segment(_divider.text, rowStyle.backgroundStyle.add(_divider.style));

        for (let lineNo = 0; lineNo < maxHeight; lineNo++) {
          if (showEdge) {
            yield left;
          }
          for (const [lastCell, renderedCell] of loopLast(alignedCells)) {
            yield* renderedCell[lineNo]!;
            if (!lastCell) {
              yield divider;
            }
          }
          if (showEdge) {
            yield right;
          }
          yield newLine;
        }

        if (first && showHeader) {
          yield new Segment(_box.getRow(widths, 'head', showEdge), borderStyle);
          yield newLine;
        }

        if (last && showFooter) {
          yield new Segment(_box.getRow(widths, 'foot', showEdge), borderStyle);
          yield newLine;
        }

        const endSection = row?.endSection ?? false;
        if (showLines || leading || endSection) {
          if (
            !last &&
            !(showFooter && index >= rowCells.length - 2) &&
            !(showHeader && headerRow)
          ) {
            if (leading) {
              yield new Segment(_box.getRow(widths, 'mid', showEdge).repeat(leading), borderStyle);
            } else {
              yield new Segment(_box.getRow(widths, 'row', showEdge), borderStyle);
            }
            yield newLine;
          }
        }
      }

      if (showEdge) {
        yield new Segment(_box.getBottom(widths), borderStyle);
        yield newLine;
      }
    } else {
      // No box
      const getRowStyle = (console: Console, index: number) => this.getRowStyle(console, index);
      const getStyle = (style: StyleType) => console.getStyle(style);

      for (const [index, [first, last, rowCell]] of Array.from(loopFirstLast(rowCells)).entries()) {
        const headerRow = first && showHeader;
        const footerRow = last && showFooter;

        let maxHeight = 1;
        const cells: Segment[][][] = [];
        const rowStyle =
          headerRow || footerRow
            ? Style.null()
            : getStyle(getRowStyle(console, index - (showHeader ? 1 : 0)));

        for (let i = 0; i < widths.length; i++) {
          const width = widths[i]!;
          const cell = rowCell[i]!;
          const column = columns[i]!;

          const renderOptions = options.update({
            width,
            height: undefined,
            highlight: column.highlight,
          });

          // Apply column settings to renderable if it's a Text object
          const cellRenderable = cell.renderable;
          if (cellRenderable && typeof cellRenderable === 'object' && 'justify' in cellRenderable) {
            if (!cellRenderable.justify) cellRenderable.justify = column.justify;
            if (cellRenderable.noWrap === undefined) cellRenderable.noWrap = column.noWrap;
            if (!cellRenderable.overflow) cellRenderable.overflow = column.overflow;
          }

          const lines = console.renderLines(
            cellRenderable,
            renderOptions,
            getStyle(cell.style).add(rowStyle)
          );
          maxHeight = Math.max(maxHeight, lines.length);
          cells.push(lines);
        }

        for (let lineNo = 0; lineNo < maxHeight; lineNo++) {
          for (const renderedCell of cells) {
            const line = renderedCell[lineNo];
            if (line) {
              yield* line;
            }
          }
          yield newLine;
        }
      }
    }
  }
}
