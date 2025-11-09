import { describe, expect, it } from 'vitest';
import { Writable } from 'node:stream';

import { Console } from '../src/console.js';
import { FileProxy } from '../src/file_proxy.js';

class DummyWritable extends Writable {
  public readonly chunks: string[] = [];
  public ended = false;

  _write(chunk: string, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.chunks.push(chunk);
    callback();
  }

  override end(chunk?: unknown, encoding?: unknown, callback?: () => void): this {
    this.ended = true;
    return super.end(chunk as never, encoding as never, callback as never);
  }
}

describe('FileProxy', () => {
  it('decodes ANSI lines and writes through console', () => {
    const dummyFile = new DummyWritable();
    const console = new Console({
      force_terminal: true,
      legacy_windows: false,
      colorSystem: 'truecolor',
    });
    const proxy = new FileProxy(console, dummyFile);

    console.beginCapture();
    proxy.write('\x1b[1mfoo\x1b[0m\nbar');
    proxy.flush();
    const result = console.endCapture();

    expect(result).toBe('\x1b[1mfoo\x1b[0m\nbar\n');
  });

  it('raises on non-string inputs', () => {
    const proxy = new FileProxy(new Console(), new DummyWritable());
    expect(() => proxy.write(123 as unknown as string)).toThrow(TypeError);
  });

  it('proxies stream methods to the underlying file', () => {
    const dummyFile = new DummyWritable();
    const proxy = new FileProxy(new Console(), dummyFile);
    expect(typeof proxy.end).toBe('function');
    proxy.end();
    expect(dummyFile.ended).toBe(true);
  });
});
