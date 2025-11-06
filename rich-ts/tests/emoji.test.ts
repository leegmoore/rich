/**
 * Tests for emoji module
 * Based on tests/test_emoji.py
 */
import { describe, it, expect } from 'vitest';
import { Emoji, NoEmoji } from '../src/emoji';
import { Console } from '../src/console';

function render(renderable: Emoji): string {
  const console = new Console({ file: { write: () => {} }, width: 80 });
  const segments = Array.from(renderable.__richConsole__(console, console.options));
  return segments.map((s) => s.text).join('');
}

describe('emoji', () => {
  it('test_no_emoji', () => {
    expect(() => new Emoji('ambivalent_bunny')).toThrow(NoEmoji);
  });

  it('test_str', () => {
    expect(new Emoji('pile_of_poo').toString()).toBe('💩');
  });

  it('test_replace', () => {
    expect(Emoji.replace('my code is :pile_of_poo:')).toBe('my code is 💩');
  });

  it('test_render', () => {
    const renderResult = render(new Emoji('pile_of_poo'));
    expect(renderResult).toBe('💩');
  });

  it('test_variant', () => {
    expect(Emoji.replace(':warning:')).toBe('⚠');
    expect(Emoji.replace(':warning-text:')).toBe('⚠\uFE0E');
    expect(Emoji.replace(':warning-emoji:')).toBe('⚠\uFE0F');
    expect(Emoji.replace(':warning-foo:')).toBe(':warning-foo:');
  });

  it('test_variant_non_default', () => {
    const renderResult = render(new Emoji('warning', 'none', 'emoji'));
    expect(renderResult).toBe('⚠\uFE0F');
  });
});
