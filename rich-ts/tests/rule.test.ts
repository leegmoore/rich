import { describe, expect, it } from 'vitest';
import { Rule } from '../src/rule.js';
import { Console } from '../src/console.js';
import { Text } from '../src/text.js';

describe('Rule', () => {
  it('test_rule', () => {
    const console = new Console({
      width: 16,
      force_terminal: true,
      legacy_windows: false,
    });

    console.beginCapture();
    console.print(new Rule());
    console.print(new Rule('foo'));
    console.rule(new Text('foo', 'bold'));
    console.rule('foobarbazeggfoobarbazegg');
    const result = console.endCapture();

    const expected =
      '\x1b[92m────────────────\x1b[0m\n' +
      '\x1b[92m───── \x1b[0mfoo\x1b[92m ──────\x1b[0m\n' +
      '\x1b[92m───── \x1b[0m\x1b[1mfoo\x1b[0m\x1b[92m ──────\x1b[0m\n' +
      '\x1b[92m─ \x1b[0mfoobarbazeg…\x1b[92m ─\x1b[0m\n';

    expect(result).toBe(expected);
  });

  it('test_rule_error', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      new Console({ width: 16, legacy_windows: false }).rule('foo', { align: 'foo' as any })
    ).toThrow('invalid value for align');
  });

  it('test_rule_align', () => {
    const console = new Console({ width: 16, legacy_windows: false });
    console.beginCapture();
    console.rule('foo');
    console.rule('foo', { align: 'left' });
    console.rule('foo', { align: 'center' });
    console.rule('foo', { align: 'right' });
    console.rule();
    const result = console.endCapture();

    const expected =
      '───── foo ──────\n' +
      'foo ────────────\n' +
      '───── foo ──────\n' +
      '──────────── foo\n' +
      '────────────────\n';

    expect(result).toBe(expected);
  });

  it('test_rule_cjk', () => {
    const console = new Console({
      width: 16,
      force_terminal: true,
      colorSystem: null,
      legacy_windows: false,
    });

    console.beginCapture();
    console.rule('欢迎！');
    const result = console.endCapture();

    expect(result).toBe('──── 欢迎！ ────\n');
  });

  it.each([
    { align: 'center' as const, outcome: '───\n' },
    { align: 'left' as const, outcome: '… ─\n' },
    { align: 'right' as const, outcome: '─ …\n' },
  ])('test_rule_not_enough_space_for_title_text ($align)', ({ align, outcome }) => {
    const console = new Console({ width: 3, record: true });
    console.beginCapture();
    console.rule('Hello!', { align });
    const result = console.endCapture();
    expect(result).toBe(outcome);
  });

  it('test_rule_center_aligned_title_not_enough_space_for_rule', () => {
    const console = new Console({ width: 4, record: true });
    console.beginCapture();
    console.rule('ABCD');
    const result = console.endCapture();
    expect(result).toBe('────\n');
  });

  it.each(['left' as const, 'right' as const])(
    'test_rule_side_aligned_not_enough_space_for_rule (%s)',
    (align) => {
      const console = new Console({ width: 2, record: true });
      console.beginCapture();
      console.rule('ABCD', { align });
      const result = console.endCapture();
      expect(result).toBe('──\n');
    }
  );

  it.each([
    { align: 'center' as const, outcome: '─ … ─\n' },
    { align: 'left' as const, outcome: 'AB… ─\n' },
    { align: 'right' as const, outcome: '─ AB…\n' },
  ])('test_rule_just_enough_width_available_for_title ($align)', ({ align, outcome }) => {
    const console = new Console({ width: 5, record: true });
    console.beginCapture();
    console.rule('ABCD', { align });
    const result = console.endCapture();
    expect(result).toBe(outcome);
  });

  it('test_characters', () => {
    const console = new Console({
      width: 16,
      force_terminal: true,
      colorSystem: null,
      legacy_windows: false,
    });

    console.beginCapture();
    console.rule(undefined, { characters: '+*' });
    console.rule('foo', { characters: '+*' });
    console.print(new Rule('', { characters: '.,' }));
    const result = console.endCapture();

    const expected = '+*+*+*+*+*+*+*+*\n' + '+*+*+ foo +*+*+*\n' + '.,.,.,.,.,.,.,.,\n';
    expect(result).toBe(expected);
  });

  it('test_repr', () => {
    const rule = new Rule('foo');
    expect(typeof rule.toString()).toBe('string');
  });

  it('test_error', () => {
    expect(() => new Rule('', { characters: '' })).toThrow(
      "'characters' argument must have a cell width of at least 1"
    );
  });
});
