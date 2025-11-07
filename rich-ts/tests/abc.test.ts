import { describe, it, expect } from 'vitest';
import { RichRenderable, isRichRenderable } from '../src/abc.js';
import { Text } from '../src/text.js';
import { Panel } from '../src/panel.js';

class Foo {
  __rich__(): Text {
    return new Text('Foo');
  }
}

class Bar {
  __richConsole__(): Iterable<string> {
    return ['Bar'];
  }
}

describe('abc', () => {
  it('recognizes rich protocol instances', () => {
    const foo = new Foo();
    const panel = new Panel('hello');

    expect(foo).toBeInstanceOf(RichRenderable);
    expect(new Text('hello')).toBeInstanceOf(RichRenderable);
    expect(panel).toBeInstanceOf(RichRenderable);
  });

  it('recognizes classes that implement the protocol', () => {
    expect(Foo).toBeInstanceOf(RichRenderable);
    expect(Text).toBeInstanceOf(RichRenderable);
  });

  it('rejects non-renderables', () => {
    expect('foo').not.toBeInstanceOf(RichRenderable);
    expect([]).not.toBeInstanceOf(RichRenderable);
    expect({}).not.toBeInstanceOf(RichRenderable);
  });

  it('provides a type guard helper', () => {
    const foo = new Foo();
    const bar = new Bar();
    expect(isRichRenderable(foo)).toBe(true);
    expect(isRichRenderable(bar)).toBe(true);
    expect(isRichRenderable('foo')).toBe(false);
  });
});
