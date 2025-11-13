import { describe, expect, it, vi } from 'vitest';
import { Console } from '../src/console.js';
import { Traceback, extract, type Frame, type Stack, type Trace } from '../src/traceback.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

describe('traceback', () => {
  describe('extract', () => {
    it('extracts traceback from Error', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test (file.js:10:5)';
      const trace = extract(error);
      expect(trace).toBeDefined();
      expect(trace.stacks).toHaveLength(1);
      expect(trace.stacks[0]?.excType).toBe('Error');
      expect(trace.stacks[0]?.excValue).toBe('Test error');
    });

    it('parses stack frames', () => {
      const error = new Error('Test');
      error.stack = `
Error: Test
    at functionName (file:///path/to/file.js:10:5)
    at /path/to/file.js:20:10
    at Object.<anonymous> (/path/to/file.js:30:15)
      `.trim();
      const trace = extract(error);
      expect(trace.stacks[0]?.frames.length).toBeGreaterThan(0);
    });

    it('handles errors without stack', () => {
      const error = new Error('Test');
      delete (error as { stack?: string }).stack;
      const trace = extract(error);
      expect(trace).toBeDefined();
      expect(trace.stacks[0]?.frames).toHaveLength(0);
    });
  });

  describe('Traceback', () => {
    it('creates traceback from trace', () => {
      const trace: Trace = {
        stacks: [
          {
            excType: 'Error',
            excValue: 'Test error',
            frames: [],
          },
        ],
      };
      const traceback = new Traceback(trace);
      expect(traceback).toBeInstanceOf(Traceback);
    });

    it('creates traceback from exception', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test (file.js:10:5)';
      const traceback = Traceback.fromException(error);
      expect(traceback).toBeInstanceOf(Traceback);
    });

    it('renders traceback', () => {
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test (file.js:10:5)';
      const traceback = Traceback.fromException(error);
      console.print(traceback);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).toContain('Error');
      expect(stripped).toContain('Test error');
    });

    it('handles empty stack traces', () => {
      const trace: Trace = {
        stacks: [
          {
            excType: 'Error',
            excValue: 'Test',
            frames: [],
          },
        ],
      };
      const traceback = new Traceback(trace);
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      console.print(traceback);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).toContain('Error');
      expect(stripped).toContain('Test');
    });

    it('respects maxFrames option', () => {
      const frames: Frame[] = Array.from({ length: 20 }, (_, i) => ({
        filename: `file${i}.js`,
        lineno: i + 1,
        name: `function${i}`,
      }));
      const trace: Trace = {
        stacks: [
          {
            excType: 'Error',
            excValue: 'Test',
            frames,
          },
        ],
      };
      const traceback = new Traceback(trace, { maxFrames: 5 });
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      console.print(traceback);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      // Should show "... X more frames" message
      expect(stripped).toMatch(/\d+\s+more\s+frames/);
    });
  });
});

