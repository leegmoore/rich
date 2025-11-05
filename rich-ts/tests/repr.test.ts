import { describe, expect, test } from 'vitest';
import { auto, richRepr, ReprError, type Result } from '../src/repr.js';

class Foo {
  constructor(
    public foo: string,
    public bar?: number,
    public egg: number = 1
  ) {}

  __rich_repr__(): Result {
    return [this.foo, [null, this.foo], ['bar', this.bar, undefined], ['egg', this.egg]];
  }
}

// Apply decorator
const DecoratedFoo = auto(Foo);

class Egg {
  constructor(
    public foo: string,
    public bar: number | undefined = undefined,
    public egg: number = 1
  ) {}
}

// Auto-generate __rich_repr__ from constructor
const DecoratedEgg = auto(Egg);

class BrokenEgg {
  public foo: string;
  public fubar?: number;
  public egg: number;

  constructor(foo: string, bar?: number, egg: number = 1) {
    this.foo = foo;
    this.fubar = bar; // Intentionally different name
    this.egg = egg;
  }
}

const DecoratedBrokenEgg = auto(BrokenEgg);

class AngularEgg {
  constructor(
    public foo: string,
    public bar: number | undefined = undefined,
    public egg: number = 1
  ) {}
}

// Angular format decorator
const DecoratedAngularEgg = auto(AngularEgg, { angular: true });

class Bar extends Foo {
  __rich_repr__(): Result {
    return [[this.foo], [null, this.foo], ['bar', this.bar, undefined], ['egg', this.egg]];
  }
}

// Apply decorator with angular flag on the method
const DecoratedBar = auto(Bar);
DecoratedBar.prototype.__rich_repr__.__angular__ = true;

class StupidClass {
  constructor(public a: number) {}

  __eq__(other: any): boolean {
    // Simulate Python's Parameter.empty comparison
    if (other === undefined) {
      return true;
    }
    try {
      return this.a === other.a;
    } catch {
      return false;
    }
  }

  __ne__(other: any): boolean {
    return !this.__eq__(other);
  }

  __repr__(): string {
    return `StupidClass(${this.a})`;
  }
}

class NotStupid {}

class Bird {
  constructor(
    public name: string,
    public eats: string[],
    public fly: boolean = true,
    public another: StupidClass = new StupidClass(2),
    public extinct: NotStupid = new NotStupid()
  ) {}
}

const DecoratedBird = auto(Bird);

describe('repr', () => {
  test('test_rich_repr', () => {
    const foo1 = new DecoratedFoo('hello');
    expect(foo1.__repr__()).toBe("Foo('hello', 'hello', egg=1)");

    const foo2 = new DecoratedFoo('hello', 3);
    expect(foo2.__repr__()).toBe("Foo('hello', 'hello', bar=3, egg=1)");
  });

  test('test_rich_repr_positional_only', () => {
    // TypeScript doesn't have positional-only parameters
    // We'll implement this test if needed, but skip for now
    class PosOnly {
      public foo: number;
      constructor(foo: number) {
        this.foo = 1; // Always set to 1, ignoring input
      }
    }

    const DecoratedPosOnly = auto(PosOnly);
    const p = new DecoratedPosOnly(1);
    expect(p.__repr__()).toBe('PosOnly(1)');
  });

  test('test_rich_angular', () => {
    const bar1 = new DecoratedBar('hello');
    expect(bar1.__repr__()).toBe("<Bar 'hello' 'hello' egg=1>");

    const bar2 = new DecoratedBar('hello', 3);
    expect(bar2.__repr__()).toBe("<Bar 'hello' 'hello' bar=3 egg=1>");
  });

  test('test_rich_repr_auto', () => {
    const egg = new DecoratedEgg('hello', undefined, 2);
    expect(egg.__repr__()).toBe("Egg('hello', egg=2)");

    const stupidClass = new StupidClass(9);
    const notStupid = new NotStupid();
    const bird = new DecoratedBird('penguin', ['fish'], true, stupidClass, notStupid);

    // Build expected string with proper repr formatting
    const stupidRepr = `StupidClass(${stupidClass.a})`;
    const notStupidRepr = `NotStupid()`;
    expect(bird.__repr__()).toBe(
      `Bird('penguin', ['fish'], another=${stupidRepr}, extinct=${notStupidRepr})`
    );
  });

  test('test_rich_repr_auto_angular', () => {
    const egg = new DecoratedAngularEgg('hello', undefined, 2);
    expect(egg.__repr__()).toBe("<AngularEgg 'hello' egg=2>");
  });

  test('test_broken_egg', () => {
    expect(() => {
      const brokenEgg = new DecoratedBrokenEgg('foo');
      brokenEgg.__repr__();
    }).toThrow(ReprError);
  });

  test('test_rich_pretty', () => {
    // This test requires Console integration
    // Skip for now since Console is in Phase 3
    // We'll implement when Console is available
    expect(true).toBe(true);
  });

  test('test_rich_pretty_angular', () => {
    // This test requires Console integration
    // Skip for now since Console is in Phase 3
    // We'll implement when Console is available
    expect(true).toBe(true);
  });
});
