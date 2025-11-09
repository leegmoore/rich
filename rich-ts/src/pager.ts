import { spawnSync } from 'node:child_process';

interface PagerCommand {
  command: string;
  args: string[];
}

const TOKEN_REGEX = /"([^"]*)"|'([^']*)'|[^\s"']+/g;
const DEFAULT_PAGER_CANDIDATES = ['less -R', 'more'];

function parseCommand(command?: string): PagerCommand | undefined {
  if (!command) {
    return undefined;
  }
  const tokens: string[] = [];
  for (const match of command.matchAll(TOKEN_REGEX)) {
    const token = match[1] ?? match[2] ?? match[0];
    if (token) {
      tokens.push(token);
    }
  }
  const [first, ...rest] = tokens;
  if (!first) {
    return undefined;
  }
  return {
    command: first,
    args: rest,
  };
}

/**
 * Base class for pager implementations.
 */
export abstract class Pager {
  /**
   * Show the provided content in the pager.
   * @param content - Text to display.
   */
  abstract show(content: string): void;
}

/**
 * Pager that launches the system pager (less/more) similar to Python's SystemPager.
 */
export class SystemPager extends Pager {
  constructor(
    private readonly pagerOverride?: string,
    private readonly spawnCommand: typeof spawnSync = spawnSync
  ) {
    super();
  }

  private getPagerCommands(): PagerCommand[] {
    const commands: Array<PagerCommand | undefined> = [];
    commands.push(parseCommand(this.pagerOverride));
    commands.push(parseCommand(process.env.PAGER?.trim()));
    for (const fallback of DEFAULT_PAGER_CANDIDATES) {
      commands.push(parseCommand(fallback));
    }
    return commands.filter((command): command is PagerCommand => Boolean(command));
  }

  private tryLaunchPager(command: PagerCommand, content: string): boolean {
    try {
      const result = this.spawnCommand(command.command, command.args, {
        input: content,
        stdio: ['pipe', 'inherit', 'inherit'],
        env: process.env,
        encoding: 'utf8',
      });
      return !result.error && (result.status === 0 || result.status === null);
    } catch {
      return false;
    }
  }

  /**
   * Show content using the first working pager, falling back to stdout.
   * @param content - Text to display.
   */
  show(content: string): void {
    for (const command of this.getPagerCommands()) {
      if (this.tryLaunchPager(command, content)) {
        return;
      }
    }
    process.stdout.write(content);
  }
}
