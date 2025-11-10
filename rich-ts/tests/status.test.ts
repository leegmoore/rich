import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Status } from '../src/status.js';
import { Spinner } from '../src/spinner.js';

const createConsole = (): Console =>
  new Console({
    colorSystem: 'none',
    width: 80,
    legacy_windows: false,
    get_time: () => 0,
  });

describe('Status', () => {
  it('updates status text and spinner variants', async () => {
    const console = createConsole();
    const status = new Status('foo', { console });
    expect(status.console).toBe(console);

    const previousRenderable = status.renderable;
    status.update({ status: 'bar', spinnerStyle: 'red', speed: 2 });
    expect(status.renderable).toBe(previousRenderable);
    expect(status.renderable).toBeInstanceOf(Spinner);

    status.update({ spinner: 'dots2' });
    expect(status.renderable).not.toBe(previousRenderable);

    status.start();
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
    } finally {
      status.stop();
    }
  });

  it('renders status inline when printed', () => {
    const console = createConsole();
    const status = new Status('foo', { console });
    console.beginCapture();
    console.print(status);
    expect(console.endCapture()).toBe('⠋ foo\n');
  });
});
