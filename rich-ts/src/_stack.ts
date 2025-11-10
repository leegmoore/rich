/**
 * Simple stack helper mirroring Rich's _stack module.
 */
export class Stack<T> {
  private readonly items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot pop from empty stack');
    }
    return this.items.pop() as T;
  }

  get top(): T {
    if (this.items.length === 0) {
      throw new Error('Stack is empty');
    }
    return this.items[this.items.length - 1] as T;
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }
}
