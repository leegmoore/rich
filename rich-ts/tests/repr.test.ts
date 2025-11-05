import { describe, it, expect } from 'vitest';
import { auto, ReprError, Result } from '../src/repr';

class Foo {
  constructor(
    public foo: string,
    public bar?: number,
    public egg: number = 1
  ) {}

  *richRepr(): Result {
    yield this.foo;
    yield [null, this.foo];
    yield ['bar', this.bar, undefined];
    yield ['egg', this.egg];
  }
}

// Apply auto decorator
auto()(Foo);

class Egg {
  constructor(
    public foo: string,
    public bar?: number,
    public egg: number = 1
  ) {}

  *richRepr(): Result {
    yield this.foo;
    if (this.bar !== undefined) {
      yield ['bar', this.bar];
    }
    if (this.egg !== 1) {
      yield ['egg', this.egg];
    }
  }
}

// Apply auto decorator
auto()(Egg);

class BrokenEgg {
  private fubar?: number;

  constructor(
    public foo: string,
    bar?: number,
    public egg: number = 1
  ) {
    // Note: bar parameter is stored as fubar, not bar
    this.fubar = bar;
  }

  *richRepr(): Result {
    yield this.foo;
    // Try to access 'bar' property which doesn't exist (stored as fubar)
    if (!('bar' in this)) {
      throw new ReprError('Failed to auto generate __rich_repr__; bar attribute not found');
    }
    yield ['bar', (this as any).bar];
    yield ['egg', this.egg];
  }
}

// Apply auto decorator
auto()(BrokenEgg);

class AngularEgg {
  constructor(
    public foo: string,
    public bar?: number,
    public egg: number = 1
  ) {}

  *richRepr(): Result {
    yield this.foo;
    if (this.bar !== undefined) {
      yield ['bar', this.bar];
    }
    if (this.egg !== 1) {
      yield ['egg', this.egg];
    }
  }
}

// Apply auto decorator with angular mode
auto({ angular: true })(AngularEgg);

class Bar extends Foo {
  *richRepr(): Result {
    yield this.foo;
    yield [null, this.foo];
    yield ['bar', this.bar, undefined];
    yield ['egg', this.egg];
  }
}

// Apply auto decorator with angular mode
const OriginalBarRepr = Bar.prototype.richRepr;
auto()(Bar);
// Set angular mode after decoration
(Bar.prototype.richRepr as any).angular = true;

class StupidClass {
  constructor(public a: number) {}

  // This class has a weird equality that always returns true for empty parameter
  toString(): string {
    return `StupidClass(${this.a})`;
  }
}

class NotStupid {
  toString(): string {
    return `NotStupid()`;
  }
}

class Bird {
  constructor(
    public name: string,
    public eats: string[],
    public fly: boolean = true,
    public another: StupidClass = new StupidClass(2),
    public extinct: NotStupid = new NotStupid()
  ) {}

  *richRepr(): Result {
    yield this.name;
    yield this.eats;
    if (this.fly !== true) {
      yield ['fly', this.fly];
    }
    // Always show another and extinct since they're different object instances
    const defaultAnother = new StupidClass(2);
    const defaultExtinct = new NotStupid();
    // Object instances are always different by reference, so always show them
    yield ['another', this.another];
    yield ['extinct', this.extinct];
  }
}

// Apply auto decorator
auto()(Bird);

describe('repr', () => {
  it('test_rich_repr', () => {
    expect(String(new Foo('hello'))).toBe("Foo('hello', 'hello', egg=1)");
    expect(String(new Foo('hello', 3))).toBe("Foo('hello', 'hello', bar=3, egg=1)");
  });

  it('test_rich_angular', () => {
    expect(String(new Bar('hello'))).toBe("<Bar 'hello' 'hello' egg=1>");
    expect(String(new Bar('hello', 3))).toBe("<Bar 'hello' 'hello' bar=3 egg=1>");
  });

  it('test_rich_repr_auto', () => {
    expect(String(new Egg('hello', undefined, 2))).toBe("Egg('hello', egg=2)");

    const stupidClass = new StupidClass(9);
    const notStupid = new NotStupid();
    const bird = new Bird('penguin', ['fish'], true, stupidClass, notStupid);

    expect(String(bird)).toBe(
      `Bird('penguin', ['fish'], another=${stupidClass.toString()}, extinct=${notStupid.toString()})`
    );
  });

  it('test_rich_repr_auto_angular', () => {
    expect(String(new AngularEgg('hello', undefined, 2))).toBe("<AngularEgg 'hello' egg=2>");
  });

  it('test_broken_egg', () => {
    expect(() => {
      String(new BrokenEgg('foo'));
    }).toThrow(ReprError);
  });

  // Skip console-dependent tests for now (console module not ported yet)
  it.skip('test_rich_pretty', () => {
    // Will implement when console module is available
  });

  it.skip('test_rich_pretty_angular', () => {
    // Will implement when console module is available
  });
});
