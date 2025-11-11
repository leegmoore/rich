import { describe, expect, it, vi } from 'vitest';
import { Console } from '../src/console.js';
import { RichHandler, LogLevel, createRichLogger, type LogRecord } from '../src/logging.js';

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\x1B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(ANSI_ESCAPE, '');

describe('logging', () => {
  describe('RichHandler', () => {
    it('creates handler with default options', () => {
      const handler = new RichHandler();
      expect(handler).toBeInstanceOf(RichHandler);
    });

    it('creates handler with custom console', () => {
      const console = new Console();
      const handler = new RichHandler({ console });
      expect(handler).toBeInstanceOf(RichHandler);
    });

    it('handles log records', () => {
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      const handler = new RichHandler({ console });
      const record: LogRecord = {
        levelname: 'INFO',
        levelno: LogLevel.INFO,
        message: 'Test message',
        created: Date.now(),
      };
      handler.emit(record);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).toContain('Test message');
      expect(stripped).toContain('INFO');
    });

    it('filters by log level', () => {
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      const handler = new RichHandler({ console, level: LogLevel.WARNING });
      const debugRecord: LogRecord = {
        levelname: 'DEBUG',
        levelno: LogLevel.DEBUG,
        message: 'Debug message',
        created: Date.now(),
      };
      const warningRecord: LogRecord = {
        levelname: 'WARNING',
        levelno: LogLevel.WARNING,
        message: 'Warning message',
        created: Date.now(),
      };
      handler.emit(debugRecord);
      handler.emit(warningRecord);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).not.toContain('Debug message');
      expect(stripped).toContain('Warning message');
    });

    it('renders level text correctly', () => {
      const handler = new RichHandler();
      const record: LogRecord = {
        levelname: 'ERROR',
        levelno: LogLevel.ERROR,
        message: 'Test',
        created: Date.now(),
      };
      const levelText = handler.getLevelText(record);
      expect(levelText.plain).toContain('ERROR');
    });

    it('handles errors gracefully', () => {
      const handler = new RichHandler();
      const record: LogRecord = {
        levelname: 'ERROR',
        levelno: LogLevel.ERROR,
        message: 'Test',
        created: Date.now(),
        exc_info: [new Error('Test error'), new Error('Test error'), null],
      };
      expect(() => handler.handle(record)).not.toThrow();
    });
  });

  describe('createRichLogger', () => {
    it('creates logger with all log methods', () => {
      const logger = createRichLogger();
      expect(logger.debug).toBeInstanceOf(Function);
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.warning).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
      expect(logger.critical).toBeInstanceOf(Function);
    });

    it('logger methods work', () => {
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      const logger = createRichLogger({ console });
      logger.info('Info message');
      logger.warning('Warning message');
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).toContain('Info message');
      expect(stripped).toContain('Warning message');
    });

    it('logger handles errors', () => {
      const console = new Console({
        width: 100,
        height: 40,
        force_terminal: true,
        colorSystem: 'truecolor',
      });
      console.beginCapture();
      const logger = createRichLogger({ console });
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      const output = console.endCapture();
      const stripped = stripAnsi(output);
      expect(stripped).toContain('Error occurred');
    });
  });

  describe('LogLevel', () => {
    it('has correct level values', () => {
      expect(LogLevel.NOTSET).toBe(0);
      expect(LogLevel.DEBUG).toBe(10);
      expect(LogLevel.INFO).toBe(20);
      expect(LogLevel.WARNING).toBe(30);
      expect(LogLevel.ERROR).toBe(40);
      expect(LogLevel.CRITICAL).toBe(50);
    });
  });
});

