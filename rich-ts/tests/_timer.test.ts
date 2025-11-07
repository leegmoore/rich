import { describe, it, expect, vi } from 'vitest';
import { Timer, timer } from '../src/_timer.js';

class MockClock {
  private current = 0;

  now = (): number => this.current;

  advance(ms: number): void {
    this.current += ms;
  }
}

describe('_timer', () => {
  it('test_timer_basic', () => {
    const clock = new MockClock();
    const perfTimer = new Timer({ clock: clock.now });

    perfTimer.start();
    clock.advance(100);
    const elapsedSeconds = perfTimer.stop();

    expect(elapsedSeconds).toBeGreaterThan(0);
    expect(perfTimer.elapsedMilliseconds).toBeCloseTo(100, 5);
  });

  it('test_timer_elapsed', () => {
    const clock = new MockClock();
    const perfTimer = new Timer({ clock: clock.now });

    perfTimer.start();
    clock.advance(125);
    expect(perfTimer.elapsedMilliseconds).toBeCloseTo(125, 5);
    clock.advance(125);
    expect(perfTimer.elapsedSeconds).toBeCloseTo(0.25, 5);
  });

  it('test_timer_restart', () => {
    const clock = new MockClock();
    const perfTimer = new Timer({ clock: clock.now });

    perfTimer.start();
    clock.advance(200);
    perfTimer.stop();

    perfTimer.start();
    clock.advance(50);
    expect(perfTimer.elapsedMilliseconds).toBeCloseTo(50, 5);
  });

  it('test_timer_context_manager', () => {
    const clock = new MockClock();
    const reporter = vi.fn();

    const handle = timer('work', { clock: clock.now, reporter });
    clock.advance(300);
    handle.stop();
    clock.advance(700);
    handle.stop();

    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter).toHaveBeenCalledWith('work elapsed 300.0ms');
  });

  it('test_timer_precision', () => {
    const clock = new MockClock();
    const perfTimer = new Timer({ clock: clock.now });

    perfTimer.start();
    for (let i = 0; i < 5; i++) {
      clock.advance(33.33);
    }
    expect(perfTimer.elapsedMilliseconds).toBeCloseTo(166.65, 2);
  });
});
