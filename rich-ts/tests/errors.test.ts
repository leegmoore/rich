import { describe, it, expect } from 'vitest';
import {
  ConsoleError,
  StyleError,
  StyleSyntaxError,
  MissingStyle,
  StyleStackError,
  NotRenderableError,
  MarkupError,
  LiveError,
  NoAltScreen,
} from '../src/errors';

describe('errors', () => {
  it('can throw and catch ConsoleError', () => {
    expect(() => {
      throw new ConsoleError('test error');
    }).toThrow(ConsoleError);
  });

  it('can throw and catch StyleError', () => {
    expect(() => {
      throw new StyleError('test error');
    }).toThrow(StyleError);
  });

  it('can throw and catch StyleSyntaxError', () => {
    expect(() => {
      throw new StyleSyntaxError('test error');
    }).toThrow(StyleSyntaxError);
  });

  it('StyleSyntaxError extends ConsoleError', () => {
    const error = new StyleSyntaxError('test');
    expect(error).toBeInstanceOf(StyleSyntaxError);
    expect(error).toBeInstanceOf(ConsoleError);
  });

  it('can throw and catch MissingStyle', () => {
    expect(() => {
      throw new MissingStyle('test error');
    }).toThrow(MissingStyle);
  });

  it('MissingStyle extends StyleError', () => {
    const error = new MissingStyle('test');
    expect(error).toBeInstanceOf(MissingStyle);
    expect(error).toBeInstanceOf(StyleError);
  });

  it('can throw and catch StyleStackError', () => {
    expect(() => {
      throw new StyleStackError('test error');
    }).toThrow(StyleStackError);
  });

  it('can throw and catch NotRenderableError', () => {
    expect(() => {
      throw new NotRenderableError('test error');
    }).toThrow(NotRenderableError);
  });

  it('can throw and catch MarkupError', () => {
    expect(() => {
      throw new MarkupError('test error');
    }).toThrow(MarkupError);
  });

  it('can throw and catch LiveError', () => {
    expect(() => {
      throw new LiveError('test error');
    }).toThrow(LiveError);
  });

  it('can throw and catch NoAltScreen', () => {
    expect(() => {
      throw new NoAltScreen('test error');
    }).toThrow(NoAltScreen);
  });

  it('error messages are preserved', () => {
    const message = 'Custom error message';
    try {
      throw new ConsoleError(message);
    } catch (error) {
      expect(error).toBeInstanceOf(ConsoleError);
      expect((error as Error).message).toBe(message);
    }
  });
});
