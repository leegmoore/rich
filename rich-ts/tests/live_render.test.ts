import { describe, expect, it } from 'vitest';
import { LiveRender, type VerticalOverflow } from '../src/live_render.js';
import { Console } from '../src/console.js';
import { Segment } from '../src/segment.js';

const createLiveRender = (
  renderable: unknown = 'my string',
  overflow: VerticalOverflow = 'ellipsis'
) => new LiveRender(renderable, '', overflow);

describe('LiveRender', () => {
  it('updates renderable content', () => {
    const liveRender = createLiveRender();
    expect(liveRender.renderable).toBe('my string');
    liveRender.setRenderable('another string');
    expect(liveRender.renderable).toBe('another string');
  });

  it('returns cursor controls for current region', () => {
    const liveRender = createLiveRender();
    expect(liveRender.positionCursor().segment.text).toBe('');
    liveRender._shape = [80, 2];
    expect(liveRender.positionCursor().toString()).toBe('\r\x1b[2K\x1b[1A\x1b[2K');
    expect(liveRender.restoreCursor().toString()).toBe('\r\x1b[1A\x1b[2K\x1b[1A\x1b[2K');
  });

  it('renders segments with optional style', () => {
    const liveRender = createLiveRender();
    const console = new Console({ width: 80, force_terminal: true, legacy_windows: false });
    const result = Array.from(liveRender.__richConsole__(console, console.options));
    expect(result).toEqual([new Segment('my string')]);

    liveRender.style = 'red';
    const styledResult = Array.from(liveRender.__richConsole__(console, console.options));
    expect(styledResult).toEqual([new Segment('my string', console.getStyle('red'))]);
  });
});
