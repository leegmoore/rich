import { describe, expect, it } from 'vitest';
import { SPINNERS } from '../src/_spinners.js';

const spinnerEntries = Object.entries(SPINNERS);

describe('_spinners data', () => {
  it('includes the canonical dots spinner frames', () => {
    const dots = SPINNERS.dots;
    expect(dots).toBeDefined();
    expect(dots.interval).toBe(80);
    expect(dots.frames.slice(0, 4)).toEqual(['⠋', '⠙', '⠹', '⠸']);
  });

  it('ensures every spinner has frames and positive intervals', () => {
    expect(spinnerEntries.length).toBeGreaterThan(0);
    for (const [, spinner] of spinnerEntries) {
      expect(spinner.interval).toBeGreaterThan(0);
      expect(spinner.frames.length).toBeGreaterThan(0);
      spinner.frames.forEach((frame) => {
        expect(typeof frame).toBe('string');
        expect(frame.length).toBeGreaterThan(0);
      });
    }
  });

  it('keeps emojis intact for complex spinners', () => {
    const arrow2 = SPINNERS.arrow2;
    expect(arrow2.frames).toContain('⬆️ ');
    expect(arrow2.frames).toContain('⬇️ ');
  });
});
