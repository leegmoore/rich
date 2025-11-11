import { Align, AlignMethod } from './align.js';
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Constrain } from './constrain.js';
import { Measurement } from './measure.js';
import { Padding, PaddingDimensions } from './padding.js';
import { Table } from './table.js';
import type { TextType } from './text.js';

/**
 * Display renderables in neat columns.
 */
export class Columns {
  public renderables: RenderableType[];
  public width?: number;
  public padding: PaddingDimensions;
  public expand: boolean;
  public equal: boolean;
  public columnFirst: boolean;
  public rightToLeft: boolean;
  public align?: AlignMethod;
  public title?: TextType;

  /**
   * Create a Columns display.
   *
   * @param renderables - Any number of Rich renderables (including strings)
   * @param padding - Optional padding around cells. Defaults to (0, 1)
   * @param width - The desired width of the columns, or undefined to auto detect
   * @param expand - Expand columns to full width. Defaults to false
   * @param equal - Arrange in to equal sized columns. Defaults to false
   * @param columnFirst - Align items from top to bottom (rather than left to right). Defaults to false
   * @param rightToLeft - Start column from right hand side. Defaults to false
   * @param align - Align value ("left", "right", or "center") or undefined for default
   * @param title - Optional title for Columns
   */
  constructor(
    renderables?: Iterable<RenderableType>,
    padding: PaddingDimensions = [0, 1],
    options: {
      width?: number;
      expand?: boolean;
      equal?: boolean;
      columnFirst?: boolean;
      rightToLeft?: boolean;
      align?: AlignMethod;
      title?: TextType;
    } = {}
  ) {
    this.renderables = renderables ? Array.from(renderables) : [];
    this.width = options.width;
    this.padding = padding;
    this.expand = options.expand ?? false;
    this.equal = options.equal ?? false;
    this.columnFirst = options.columnFirst ?? false;
    this.rightToLeft = options.rightToLeft ?? false;
    this.align = options.align;
    this.title = options.title;
  }

  /**
   * Add a renderable to the columns.
   *
   * @param renderable - Any renderable object
   */
  addRenderable(renderable: RenderableType): void {
    this.renderables.push(renderable);
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const renderStr = console.renderStr.bind(console);
    const renderables = this.renderables.map((renderable) =>
      typeof renderable === 'string' ? renderStr(renderable) : renderable
    );

    if (renderables.length === 0) {
      return;
    }

    const [, right, , left] = Padding.unpack(this.padding);
    const widthPadding = Math.max(left, right);
    const maxWidth = options.maxWidth;
    const widths: Map<number, number> = new Map();
    let columnCount = renderables.length;

    const getMeasurement = Measurement.get.bind(Measurement);
    let renderableWidths = renderables.map(
      (renderable) => getMeasurement(console, options, renderable).maximum
    );

    if (this.equal) {
      const maxRenderableWidth = Math.max(...renderableWidths);
      renderableWidths = renderableWidths.map(() => maxRenderableWidth);
    }

    type WidthRenderable = [number, RenderableType | undefined];

    function* iterRenderables(this: Columns, columnCount: number): Generator<WidthRenderable> {
      const itemCount = renderables.length;

      if (this.columnFirst) {
        const widthRenderables: WidthRenderable[] = renderableWidths.map((width, i) => [
          width,
          renderables[i],
        ]);

        const columnLengths: number[] = Array(columnCount).fill(
          Math.floor(itemCount / columnCount)
        ) as number[];
        for (let colNo = 0; colNo < itemCount % columnCount; colNo++) {
          columnLengths[colNo]! += 1;
        }

        const rowCount = Math.ceil(itemCount / columnCount);
        const cells: number[][] = Array(rowCount)
          .fill(0)
          .map(() => Array(columnCount).fill(-1) as number[]);

        let row = 0;
        let col = 0;
        for (let index = 0; index < itemCount; index++) {
          cells[row]![col] = index;
          columnLengths[col]! -= 1;
          if (columnLengths[col]! > 0) {
            row += 1;
          } else {
            col += 1;
            row = 0;
          }
        }

        for (const cellRow of cells) {
          for (const index of cellRow) {
            if (index === -1) {
              return;
            }
            yield widthRenderables[index]!;
          }
        }
      } else {
        for (let i = 0; i < renderables.length; i++) {
          yield [renderableWidths[i]!, renderables[i]];
        }
      }

      // Pad odd elements with spaces
      if (itemCount % columnCount !== 0) {
        for (let i = 0; i < columnCount - (itemCount % columnCount); i++) {
          yield [0, undefined];
        }
      }
    }

    const boundIterRenderables = iterRenderables.bind(this);

    const table = Table.grid({ padding: this.padding, collapsePadding: true, padEdge: false });
    table.expand = this.expand;
    table.title = this.title;

    if (this.width !== undefined) {
      const singleColumnWidth = this.width + widthPadding;
      const calculatedColumns =
        singleColumnWidth > 0 ? Math.floor(maxWidth / singleColumnWidth) : renderables.length || 1;
      // Prevent zero/negative column counts which would hang iteration when width exceeds console
      columnCount = Math.max(1, calculatedColumns);
      for (let i = 0; i < columnCount; i++) {
        table.addColumn('', '', { width: this.width });
      }
    } else {
      while (columnCount > 1) {
        widths.clear();
        let columnNo = 0;

        for (const [renderableWidth] of boundIterRenderables(columnCount)) {
          const currentWidth = widths.get(columnNo) ?? 0;
          widths.set(columnNo, Math.max(currentWidth, renderableWidth));
          const totalWidth =
            Array.from(widths.values()).reduce((a, b) => a + b, 0) +
            widthPadding * (widths.size - 1);

          if (totalWidth > maxWidth) {
            columnCount = widths.size - 1;
            break;
          }

          columnNo = (columnNo + 1) % columnCount;
        }

        if (columnCount === widths.size || columnCount === 1) {
          break;
        }
      }
    }

    const getRenderableFromTuple = ([, renderable]: WidthRenderable): RenderableType | undefined =>
      renderable;
    let _renderables = Array.from(boundIterRenderables(columnCount)).map(getRenderableFromTuple);

    if (this.equal) {
      const equalWidth = renderableWidths[0];
      _renderables = _renderables.map((renderable) =>
        renderable === undefined ? undefined : new Constrain(renderable, equalWidth)
      );
    }

    if (this.align) {
      const align = this.align;
      _renderables = _renderables.map((renderable) =>
        renderable === undefined ? undefined : new Align(renderable, align)
      );
    }

    const rightToLeft = this.rightToLeft;
    for (let start = 0; start < _renderables.length; start += columnCount) {
      let row = _renderables.slice(start, start + columnCount);
      if (rightToLeft) {
        row = row.reverse();
      }
      table.addRow(...row);
    }

    yield* console.render(table, options);
  }
}
