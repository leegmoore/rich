import { readSync } from 'node:fs';
import { Console } from './console.js';
import { Text, type TextType } from './text.js';

export interface PromptInputStream {
  readLine(): string | null;
}

export class PromptError extends Error {}

export class InvalidResponse extends PromptError {
  readonly renderable: TextType;

  constructor(message: TextType) {
    super(typeof message === 'string' ? message : 'Invalid response');
    this.renderable = message;
  }
}

export interface PromptBaseOptions {
  console?: Console;
  password?: boolean;
  choices?: string[];
  caseSensitive?: boolean;
  showDefault?: boolean;
  showChoices?: boolean;
}

interface PromptLoopConfig<T> {
  stream?: PromptInputStream;
  hasDefault: boolean;
  defaultValue?: T;
}

const STDIN_FD =
  typeof process !== 'undefined' && process.stdin && typeof process.stdin.fd === 'number'
    ? process.stdin.fd
    : undefined;

function readLineFromStdin(options: { password?: boolean } = {}): string {
  const { password = false } = options;
  if (STDIN_FD === undefined) {
    return '';
  }
  const chunks: string[] = [];
  const buffer = Buffer.alloc(1);
  const stdin = typeof process !== 'undefined' ? (process.stdin as NodeJS.ReadStream) : undefined;
  let restoreRaw: (() => void) | undefined;
  if (password && stdin && stdin.isTTY && typeof stdin.setRawMode === 'function') {
    const wasRaw = stdin.isRaw ?? false;
    stdin.setRawMode(true);
    restoreRaw = () => {
      stdin.setRawMode(wasRaw);
    };
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bytesRead = 0;
    try {
      bytesRead = readSync(STDIN_FD, buffer, 0, 1, null);
    } catch {
      break;
    }
    if (bytesRead <= 0) {
      break;
    }
    const char = buffer.toString('utf8', 0, bytesRead);
    if (char === '\n' || char === '\r') {
      break;
    }
    chunks.push(char);
  }
  if (restoreRaw) {
    restoreRaw();
  }
  return chunks.join('');
}

export abstract class PromptBase<T> {
  protected readonly console: Console;
  protected readonly prompt: Text;
  protected readonly password: boolean;
  protected readonly choices?: string[];
  protected readonly caseSensitive: boolean;
  protected readonly showDefault: boolean;
  protected readonly showChoices: boolean;
  protected promptSuffix = ': ';
  protected validateErrorMessage = '[prompt.invalid]Please enter a valid value';
  protected illegalChoiceMessage =
    '[prompt.invalid.choice]Please select one of the available options';

  protected constructor(prompt: TextType = '', options: PromptBaseOptions = {}) {
    this.console = options.console ?? new Console({ force_terminal: true });
    this.prompt =
      typeof prompt === 'string' ? Text.fromMarkup(prompt, { style: 'prompt' }) : prompt.copy();
    this.prompt.end = '';
    this.password = options.password ?? false;
    this.choices = options.choices ? [...options.choices] : undefined;
    this.caseSensitive = options.caseSensitive ?? true;
    this.showDefault = options.showDefault ?? true;
    this.showChoices = options.showChoices ?? true;
  }

  protected renderDefault(defaultValue: unknown): Text {
    return new Text(`(${defaultValue as string})`, 'prompt.default');
  }

  protected makePrompt(defaultValue: T | undefined, hasDefault: boolean): Text {
    const prompt = this.prompt.copy();
    prompt.end = '';
    if (this.showChoices && this.choices && this.choices.length > 0) {
      const choiceText = `[${this.choices.join('/')}]`;
      prompt.append(' ');
      prompt.append(choiceText, 'prompt.choices');
    }
    if (hasDefault && this.showDefault && defaultValue !== undefined) {
      prompt.append(' ');
      prompt.append(this.renderDefault(defaultValue));
    }
    prompt.append(this.promptSuffix);
    return prompt;
  }

  protected prePrompt(): void {
    // Hook for subclasses
  }

  protected onValidateError(_value: string, error: InvalidResponse): void {
    this.console.print(error.renderable);
  }

  protected convert(value: string): T {
    return value as unknown as T;
  }

  protected normalizeChoice(value: string): string | null {
    if (!this.choices || this.choices.length === 0) {
      return null;
    }
    if (this.caseSensitive) {
      if (this.choices.includes(value)) {
        return value;
      }
      throw new InvalidResponse(this.illegalChoiceMessage);
    }
    const lowerChoices = this.choices.map((choice) => choice.toLowerCase());
    const index = lowerChoices.indexOf(value.toLowerCase());
    if (index === -1) {
      throw new InvalidResponse(this.illegalChoiceMessage);
    }
    const match = this.choices[index];
    if (match === undefined) {
      throw new InvalidResponse(this.illegalChoiceMessage);
    }
    return match;
  }

  protected processResponse(rawValue: string): T {
    const trimmed = rawValue.trim();
    const normalizedChoice = this.normalizeChoice(trimmed);
    const target = normalizedChoice ?? trimmed;
    try {
      return this.convert(target);
    } catch {
      throw new InvalidResponse(this.validateErrorMessage);
    }
  }

  protected promptLoop(config: PromptLoopConfig<T>): T {
    const { stream, hasDefault, defaultValue } = config;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.prePrompt();
      const promptText = this.makePrompt(defaultValue, hasDefault);
      const response = PromptBase.getInput(this.console, promptText, this.password, stream);
      if (response === '' && hasDefault) {
        return defaultValue as T;
      }
      try {
        return this.processResponse(response);
      } catch (error) {
        if (error instanceof InvalidResponse) {
          this.onValidateError(response, error);
          continue;
        }
        throw error;
      }
    }
  }

  protected static getInput(
    console: Console,
    prompt: Text,
    password: boolean,
    stream?: PromptInputStream
  ): string {
    console.write(prompt);
    if (stream) {
      const line = stream.readLine();
      return line ?? '';
    }
    const value = readLineFromStdin({ password });
    if (!password && console.is_interactive) {
      // Mirror newline to keep cursor on next line for interactive terminals.
      console.print('');
    }
    return value;
  }
}

export interface PromptAskOptions<T> extends PromptBaseOptions {
  default?: T;
  stream?: PromptInputStream;
}

export class Prompt extends PromptBase<string> {
  constructor(prompt: TextType = '', options: PromptBaseOptions = {}) {
    super(prompt, options);
  }

  static ask(prompt: TextType = '', options: PromptAskOptions<string> = {}): string {
    const { stream, default: defaultValue, ...rest } = options;
    const instance = new Prompt(prompt, rest);
    const hasDefault = Object.prototype.hasOwnProperty.call(options, 'default');
    return instance.promptLoop({ stream, hasDefault, defaultValue });
  }

  ask(options: PromptAskOptions<string> = {}): string {
    const { stream, default: defaultValue } = options;
    const hasDefault = Object.prototype.hasOwnProperty.call(options, 'default');
    return this.promptLoop({ stream, hasDefault, defaultValue });
  }
}

export class IntPrompt extends PromptBase<number> {
  constructor(prompt: TextType = '', options: PromptBaseOptions = {}) {
    super(prompt, options);
    this.validateErrorMessage = '[prompt.invalid]Please enter a valid integer number';
  }

  static ask(prompt: TextType = '', options: PromptAskOptions<number> = {}): number {
    const { stream, default: defaultValue, ...rest } = options;
    const instance = new IntPrompt(prompt, rest);
    const hasDefault = Object.prototype.hasOwnProperty.call(options, 'default');
    return instance.promptLoop({ stream, hasDefault, defaultValue });
  }

  protected override convert(value: string): number {
    if (value === '') {
      throw new InvalidResponse(this.validateErrorMessage);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new InvalidResponse(this.validateErrorMessage);
    }
    return parsed;
  }
}

export class FloatPrompt extends PromptBase<number> {
  constructor(prompt: TextType = '', options: PromptBaseOptions = {}) {
    super(prompt, options);
    this.validateErrorMessage = '[prompt.invalid]Please enter a number';
  }

  static ask(prompt: TextType = '', options: PromptAskOptions<number> = {}): number {
    const { stream, default: defaultValue, ...rest } = options;
    const instance = new FloatPrompt(prompt, rest);
    const hasDefault = Object.prototype.hasOwnProperty.call(options, 'default');
    return instance.promptLoop({ stream, hasDefault, defaultValue });
  }

  protected override convert(value: string): number {
    if (value === '') {
      throw new InvalidResponse(this.validateErrorMessage);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new InvalidResponse(this.validateErrorMessage);
    }
    return parsed;
  }
}

export class Confirm extends PromptBase<boolean> {
  private readonly yesChoice: string;
  private readonly noChoice: string;

  constructor(
    prompt: TextType = '',
    options: PromptBaseOptions = {},
    defaultChoices: [string, string] = ['y', 'n']
  ) {
    const choices = options.choices ?? defaultChoices;
    super(prompt, { ...options, choices });
    this.validateErrorMessage = '[prompt.invalid]Please enter Y or N';
    this.yesChoice = choices[0] ?? 'y';
    this.noChoice = choices[1] ?? 'n';
  }

  static ask(prompt: TextType = '', options: PromptAskOptions<boolean> = {}): boolean {
    const { stream, default: defaultValue, ...rest } = options;
    const instance = new Confirm(prompt, rest);
    const hasDefault = Object.prototype.hasOwnProperty.call(options, 'default');
    return instance.promptLoop({ stream, hasDefault, defaultValue });
  }

  protected override renderDefault(defaultValue: unknown): Text {
    const value = Boolean(defaultValue);
    const choice = value ? this.yesChoice : this.noChoice;
    return new Text(`(${choice})`, 'prompt.default');
  }

  protected override processResponse(rawValue: string): boolean {
    const normalized = rawValue.trim().toLowerCase();
    const yes = this.yesChoice.toLowerCase();
    const no = this.noChoice.toLowerCase();
    if (normalized === yes) {
      return true;
    }
    if (normalized === no) {
      return false;
    }
    throw new InvalidResponse(this.validateErrorMessage);
  }
}
