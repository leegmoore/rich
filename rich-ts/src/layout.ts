import { ratioResolve, type RatioEdge } from './_ratio.js';
import { Align } from './align.js';
import { Console, type ConsoleOptions, type RenderableType, type RenderResult } from './console.js';
import { ReprHighlighter } from './highlighter.js';
import { Panel } from './panel.js';
import { Pretty } from './pretty.js';
import { Region } from './region.js';
import { Segment } from './segment.js';
import { Styled } from './styled.js';
import { Table } from './table.js';
import { Tree } from './tree.js';
import type { StyleType } from './style.js';

export interface LayoutRender {
  region: Region;
  render: Segment[][];
}

type RegionMap = Map<Layout, Region>;
type RenderMap = Map<Layout, LayoutRender>;

export class LayoutError extends Error {}
export class NoSplitter extends LayoutError {}

class Placeholder {
  private readonly highlighter = new ReprHighlighter();

  constructor(
    private readonly layout: Layout,
    private readonly style: StyleType | undefined = undefined
  ) {}

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.maxWidth;
    const height = options.height ?? console.height ?? console.options.maxHeight ?? 0;
    const title = this.layout.name
      ? `${reprName(this.layout.name)} (${width} x ${height})`
      : `(${width} x ${height})`;
    const highlightedTitle = this.highlighter.call(title);
    const panel = new Panel(
      Align.center(new Pretty(this.layout), { vertical: 'middle' }),
      undefined,
      {
        style: this.style ?? 'none',
        title: highlightedTitle,
        borderStyle: 'blue',
        height: height > 0 ? height : undefined,
      }
    );
    yield* console.render(panel, options);
  }
}

abstract class Splitter {
  abstract readonly name: string;
  abstract getTreeIcon(): string;
  abstract divide(children: Layout[], region: Region): Array<[Layout, Region]>;
}

class RowSplitter extends Splitter {
  readonly name = 'row';

  getTreeIcon(): string {
    return '[layout.tree.row]⬌';
  }

  divide(children: Layout[], region: Region): Array<[Layout, Region]> {
    const x = region.x;
    const y = region.y;
    const widths = resolveRegions(region.width, children);
    const results: Array<[Layout, Region]> = [];
    let offset = 0;
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index]!;
      const childWidth = widths[index] ?? 0;
      results.push([child, new Region(x + offset, y, childWidth, region.height)]);
      offset += childWidth;
    }
    return results;
  }
}

class ColumnSplitter extends Splitter {
  readonly name = 'column';

  getTreeIcon(): string {
    return '[layout.tree.column]⬍';
  }

  divide(children: Layout[], region: Region): Array<[Layout, Region]> {
    const x = region.x;
    const y = region.y;
    const heights = resolveRegions(region.height, children);
    const results: Array<[Layout, Region]> = [];
    let offset = 0;
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index]!;
      const childHeight = heights[index] ?? 0;
      results.push([child, new Region(x, y + offset, region.width, childHeight)]);
      offset += childHeight;
    }
    return results;
  }
}

function resolveRegions(total: number, children: Layout[]): number[] {
  if (children.length === 0) {
    return [];
  }
  const edges: RatioEdge[] = children.map((child) => ({
    size: child.size,
    ratio: child.ratio,
    minimumSize: child.minimumSize,
  }));
  return ratioResolve(total, edges);
}

export class Layout {
  static readonly splitters: Record<string, () => Splitter> = {
    row: () => new RowSplitter(),
    column: () => new ColumnSplitter(),
  };

  private _renderable: RenderableType;
  readonly size?: number | null;
  readonly minimumSize: number;
  readonly ratio: number;
  readonly name?: string;
  visible: boolean;
  splitter: Splitter;
  private readonly _children: Layout[] = [];
  private _renderMap: RenderMap = new Map();

  constructor(
    renderable: RenderableType | null = null,
    {
      name,
      size = null,
      minimumSize = 1,
      ratio = 1,
      visible = true,
    }: {
      name?: string;
      size?: number | null;
      minimumSize?: number;
      ratio?: number;
      visible?: boolean;
    } = {}
  ) {
    this._renderable = renderable ?? new Placeholder(this);
    this.name = name;
    this.size = size;
    this.minimumSize = Math.max(1, minimumSize);
    this.ratio = Math.max(1, ratio);
    this.visible = visible;
    this.splitter = resolveSplitter('column');
  }

  get renderable(): RenderableType {
    return this.children.length > 0 ? this : this._renderable;
  }

  get children(): Layout[] {
    return this._children.filter((child) => child.visible);
  }

  get map(): RenderMap {
    return this._renderMap;
  }

  get(name: string): Layout | undefined {
    if (this.name === name) {
      return this;
    }
    for (const child of this._children) {
      const result = child.get(name);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  split(...args: Array<Layout | RenderableType | Splitter | string>): void {
    let splitter: Splitter | string = 'column';
    const layouts: Array<Layout | RenderableType> = [];
    for (const arg of args) {
      if (isSplitterValue(arg)) {
        splitter = arg;
      } else {
        layouts.push(arg as Layout | RenderableType);
      }
    }
    const resolvedLayouts = layouts.map((layout) =>
      layout instanceof Layout ? layout : new Layout(layout)
    );
    const splitterInstance = resolveSplitter(splitter);
    this.splitter = splitterInstance;
    this._children.length = 0;
    this._children.push(...resolvedLayouts);
  }

  addSplit(...layouts: Array<Layout | RenderableType>): void {
    for (const layout of layouts) {
      this._children.push(layout instanceof Layout ? layout : new Layout(layout));
    }
  }

  splitRow(...layouts: Array<Layout | RenderableType>): void {
    this.split(...layouts, 'row');
  }

  splitColumn(...layouts: Array<Layout | RenderableType>): void {
    this.split(...layouts, 'column');
  }

  unsplit(): void {
    this._children.length = 0;
  }

  update(renderable: RenderableType): void {
    this._renderable = renderable;
  }

  refreshScreen(console: Console, layoutName: string): void {
    const target = this.get(layoutName);
    if (!target) {
      throw new Error(`No layout with name ${layoutName}`);
    }
    const renderEntry = this._renderMap.get(target);
    if (!renderEntry) {
      console.print(this);
      return;
    }
    const { region } = renderEntry;
    const dimensions = console.options.updateDimensions(region.width, region.height);
    const render = console.renderLines(target.renderable, dimensions);
    this._renderMap.set(target, { region, render });
    if (typeof console.updateScreenLines === 'function') {
      console.updateScreenLines(render, region.x, region.y);
    } else {
      console.print(this);
    }
  }

  get tree(): Tree {
    const summary = (layout: Layout): Table => {
      const table = Table.grid({ padding: [0, 1, 0, 0] });
      const icon = layout.splitter.getTreeIcon();
      const renderable = layout.visible
        ? new Pretty(layout)
        : new Styled(new Pretty(layout), 'dim');
      table.addRow(icon, renderable);
      return table;
    };
    const root = new Tree(summary(this), {
      guideStyle: `layout.tree.${this.splitter.name}`,
      highlight: true,
    });
    const walk = (treeNode: Tree, layout: Layout): void => {
      for (const child of layout._children) {
        const branch = treeNode.add(summary(child), {
          guideStyle: `layout.tree.${child.splitter.name}`,
        });
        walk(branch, child);
      }
    };
    walk(root, this);
    return root;
  }

  render(console: Console, options: ConsoleOptions): RenderMap {
    const width = options.maxWidth ?? console.width ?? console.options.maxWidth ?? 0;
    const height = options.height ?? console.height ?? console.options.maxHeight ?? 0;
    const regionMap = this.makeRegionMap(width, height);
    const renderMap: RenderMap = new Map();
    for (const [layout, region] of regionMap.entries()) {
      if (layout.children.length > 0) {
        continue;
      }
      const dimensions = options.updateDimensions(region.width, region.height);
      const lines = console.renderLines(layout.renderable, dimensions);
      renderMap.set(layout, { region, render: lines });
    }
    return renderMap;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.maxWidth ?? console.width ?? console.options.maxWidth ?? 0;
    const height = options.height ?? console.height ?? console.options.maxHeight ?? 0;
    const renderOptions = options.updateDimensions(width, height);
    const renderMap = this.render(console, renderOptions);
    this._renderMap = renderMap;

    const totalRows = Math.max(height, 0);
    const layoutRows: Segment[][] = Array.from({ length: totalRows }, () => []);
    for (const { region, render } of renderMap.values()) {
      for (
        let offsetY = 0;
        offsetY < render.length && region.y + offsetY < totalRows;
        offsetY += 1
      ) {
        const row = layoutRows[region.y + offsetY];
        if (row) {
          row.push(...render[offsetY]!);
        }
      }
    }

    const newLine = Segment.line();
    if (layoutRows.length === 0) {
      yield newLine;
      return;
    }

    for (const row of layoutRows) {
      yield* row;
      yield newLine;
    }
  }

  private makeRegionMap(width: number, height: number): RegionMap {
    const queue: Array<[Layout, Region]> = [[this, new Region(0, 0, width, height)]];
    const regionMap: RegionMap = new Map();
    while (queue.length > 0) {
      const [layout, region] = queue.shift()!;
      regionMap.set(layout, region);
      const children = layout.children;
      if (children.length) {
        for (const entry of layout.splitter.divide(children, region)) {
          queue.push(entry);
        }
      }
    }
    return regionMap;
  }

  __rich_repr__(): Array<[string | null, unknown, unknown?]> {
    return [
      ['name', this.name ?? null, null],
      ['size', this.size ?? null, null],
      ['minimum_size', this.minimumSize, 1],
      ['ratio', this.ratio, 1],
    ];
  }
}

function resolveSplitter(splitter: Splitter | string): Splitter {
  if (typeof splitter !== 'string') {
    return splitter;
  }
  const factory = Layout.splitters[splitter];
  if (!factory) {
    throw new NoSplitter(`No splitter called ${splitter}`);
  }
  return factory();
}

function isSplitterValue(value: unknown): value is Splitter | string {
  if (typeof value === 'string') {
    return true;
  }
  if (value instanceof Layout) {
    return false;
  }
  if (value && typeof value === 'object') {
    return (
      'divide' in (value as Record<string, unknown>) &&
      'getTreeIcon' in (value as Record<string, unknown>)
    );
  }
  return false;
}

function reprName(name: string): string {
  const escaped = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}
