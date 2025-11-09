import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Control } from './control.js';
import { ControlType, Segment } from './segment.js';
import type { StyleType } from './style.js';
import { Text } from './text.js';
import { loopLast } from './_loop.js';

export type VerticalOverflow = 'crop' | 'ellipsis' | 'visible';

export class LiveRender {
  renderable: RenderableType;
  style: StyleType;
  verticalOverflow: VerticalOverflow;
  _shape: [number, number] | undefined;

  constructor(
    renderable: RenderableType,
    style: StyleType = '',
    verticalOverflow: VerticalOverflow = 'ellipsis'
  ) {
    this.renderable = renderable;
    this.style = style;
    this.verticalOverflow = verticalOverflow;
    this._shape = undefined;
  }

  setRenderable(renderable: RenderableType): void {
    this.renderable = renderable;
  }

  positionCursor(): Control {
    if (!this._shape) {
      return new Control();
    }
    const [, height] = this._shape;
    if (height <= 0) {
      return new Control();
    }
    const codes: Array<ControlType | [ControlType, number]> = [
      ControlType.CARRIAGE_RETURN,
      [ControlType.ERASE_IN_LINE, 2],
    ];
    for (let i = 0; i < height - 1; i++) {
      codes.push([ControlType.CURSOR_UP, 1], [ControlType.ERASE_IN_LINE, 2]);
    }
    return new Control(...codes);
  }

  restoreCursor(): Control {
    if (!this._shape) {
      return new Control();
    }
    const [, height] = this._shape;
    if (height <= 0) {
      return new Control();
    }
    const codes: Array<ControlType | [ControlType, number]> = [ControlType.CARRIAGE_RETURN];
    for (let i = 0; i < height; i++) {
      codes.push([ControlType.CURSOR_UP, 1], [ControlType.ERASE_IN_LINE, 2]);
    }
    return new Control(...codes);
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const style = this.style ? console.getStyle(this.style) : undefined;
    const lines = Array.from(console.renderLines(this.renderable, options, style, false));
    let shape: [number, number] = Segment.getShape(lines);
    const [, height] = shape;
    const availableHeight = options.height ?? options.maxHeight;

    if (availableHeight !== undefined && height > availableHeight) {
      if (this.verticalOverflow === 'crop') {
        lines.splice(availableHeight);
        shape = Segment.getShape(lines);
      } else if (this.verticalOverflow === 'ellipsis' && availableHeight > 0) {
        lines.splice(Math.max(availableHeight - 1, 0));
        const overflowText = new Text('...', 'live.ellipsis', {
          overflow: 'crop',
          justify: 'center',
          end: '',
        });
        lines.push(Array.from(console.render(overflowText, options)));
        shape = Segment.getShape(lines);
      }
    }

    this._shape = shape;
    const newline = Segment.line();
    for (const [isLast, line] of loopLast(lines)) {
      for (const segment of line) {
        yield segment;
      }
      if (!isLast) {
        yield newline;
      }
    }
  }
}
