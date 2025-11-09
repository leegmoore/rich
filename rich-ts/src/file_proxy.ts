import type { Writable } from 'node:stream';

import { AnsiDecoder } from './ansi.js';
import { Console } from './console.js';
import { Text } from './text.js';

type WritableLike = Writable & { fileno?: () => number } & { fd?: number };

export class FileProxy {
  private readonly console: Console;
  private readonly file: WritableLike;
  private readonly buffer: string[] = [];
  private readonly decoder = new AnsiDecoder();

  constructor(console: Console, file: WritableLike) {
    this.console = console;
    this.file = file;

    return new Proxy(this, {
      get: (target, property, receiver) => {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property, receiver);
        }
        const fileValue: unknown = Reflect.get(target.file, property);
        if (typeof fileValue === 'function') {
          return (fileValue as (...args: unknown[]) => unknown).bind(target.file);
        }
        return fileValue;
      },
      set: (target, property, value, receiver) => {
        if (Reflect.has(target, property)) {
          return Reflect.set(target, property, value, receiver);
        }
        Reflect.set(target.file, property, value);
        return true;
      },
    }) as FileProxy;
  }

  get richProxiedFile(): WritableLike {
    return this.file;
  }

  write(text: string): number {
    if (typeof text !== 'string') {
      throw new TypeError(`write() argument must be str, not ${typeof text}`);
    }

    let remaining = text;
    const lines: string[] = [];

    while (remaining) {
      const newlineIndex = remaining.indexOf('\n');
      if (newlineIndex === -1) {
        this.buffer.push(remaining);
        break;
      }
      const line = remaining.slice(0, newlineIndex);
      lines.push(this.buffer.join('') + line);
      this.buffer.length = 0;
      remaining = remaining.slice(newlineIndex + 1);
    }

    if (lines.length) {
      const joined = new Text('\n').join(lines.map((line) => this.decoder.decodeLine(line)));
      this.console.print(joined);
    }

    return text.length;
  }

  flush(): void {
    if (this.buffer.length) {
      this.console.print(this.buffer.join(''));
      this.buffer.length = 0;
    }
  }

  fileno(): number | undefined {
    if (typeof this.file.fileno === 'function') {
      return this.file.fileno();
    }
    if (typeof this.file.fd === 'number') {
      return this.file.fd;
    }
    return undefined;
  }

  // Proxy unknown properties to the underlying file
  [key: string | symbol]: unknown;
}

export default FileProxy;
