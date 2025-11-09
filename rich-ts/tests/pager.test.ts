import { describe, expect, it, vi, afterEach } from 'vitest';
import type { SpawnSyncReturns } from 'node:child_process';
import { Pager, SystemPager } from '../src/pager';

describe('Pager', () => {
  afterEach(() => {
    delete process.env.PAGER;
  });

  it('allows subclasses to capture content when show is called', () => {
    const captured: string[] = [];

    class TestPager extends Pager {
      show(content: string): void {
        captured.push(content);
      }
    }

    const pager = new TestPager();
    pager.show('hello');
    pager.show('world');

    expect(captured).toEqual(['hello', 'world']);
  });
});

describe('SystemPager', () => {
  afterEach(() => {
    delete process.env.PAGER;
  });

  it('invokes the configured pager command before falling back to stdout', () => {
    const spawnStub = vi.fn<
      (
        ...args: Parameters<(typeof import('node:child_process'))['spawnSync']>
      ) => SpawnSyncReturns<Buffer>
    >(() => ({
      pid: 1,
      output: [],
      stdout: null,
      stderr: null,
      status: 0,
      signal: null,
    }));
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    process.env.PAGER = 'cat -u';

    const pager = new SystemPager(undefined, spawnStub);
    pager.show('paged content');

    expect(spawnStub).toHaveBeenCalled();
    expect(spawnStub.mock.calls[0]?.[0]).toBe('cat');
    expect(spawnStub.mock.calls[0]?.[2]?.stdio).toEqual(['pipe', 'inherit', 'inherit']);
    expect(writeSpy).not.toHaveBeenCalled();
    writeSpy.mockRestore();
  });

  it('falls back to stdout if all pager commands fail', () => {
    const spawnStub = vi.fn(() => {
      throw new Error('spawn failed');
    });
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const pager = new SystemPager('nonexistent', spawnStub);
    pager.show('fallback content');

    expect(spawnStub).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith('fallback content');
    writeSpy.mockRestore();
  });
});
