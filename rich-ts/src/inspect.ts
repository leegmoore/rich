import type { RenderableType } from './console.js';
import { ReprHighlighter } from './highlighter.js';
import { Panel } from './panel.js';
import { Pretty } from './pretty.js';
import { Table } from './table.js';
import { Text } from './text.js';
import { Renderables } from './containers.js';

export interface InspectOptions {
  title?: string | Text;
  help?: boolean;
  methods?: boolean;
  docs?: boolean;
  private?: boolean;
  dunder?: boolean;
  sort?: boolean;
  all?: boolean;
  value?: boolean;
}

/**
 * Get the first paragraph from a docstring or comment.
 */
function firstParagraph(doc: string): string {
  const paragraph = doc.split('\n\n')[0];
  return paragraph ?? doc;
}

/**
 * Escape control codes in text.
 */
function escapeControlCodes(text: string): string {
  // Remove ANSI escape sequences
  return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}

/**
 * A renderable to inspect any JavaScript/TypeScript object.
 */
export class Inspect {
  private readonly highlighter: ReprHighlighter;
  private readonly obj: unknown;
  private readonly title: string | Text;
  private readonly help: boolean;
  private readonly methods: boolean;
  private readonly docs: boolean;
  private readonly private: boolean;
  private readonly dunder: boolean;
  private readonly sort: boolean;
  private readonly value: boolean;

  constructor(obj: unknown, options: InspectOptions = {}) {
    this.highlighter = new ReprHighlighter();
    this.obj = obj;
    this.help = options.help ?? false;
    this.methods = options.methods ?? false;
    this.docs = options.docs ?? true;
    this.private = options.private ?? false;
    this.dunder = options.dunder ?? false;
    this.sort = options.sort ?? true;
    this.value = options.value ?? true;

    if (options.all) {
      this.methods = true;
      this.private = true;
      this.dunder = true;
    }

    this.title = options.title ?? this.makeTitle(obj);
  }

  private makeTitle(obj: unknown): Text {
    let titleStr: string;
    if (typeof obj === 'function') {
      titleStr = obj.name || 'Function';
    } else if (obj && typeof obj === 'object') {
      const constructor = (obj as { constructor?: { name?: string } }).constructor;
      titleStr = constructor?.name ?? 'Object';
    } else {
      titleStr = typeof obj;
    }
    return this.highlighter.call(titleStr);
  }

  private getDoc(obj: unknown): string | null {
    // In JavaScript/TypeScript, we can't easily get docstrings like Python
    // Check for JSDoc comments or function.toString() for basic info
    if (typeof obj === 'function') {
      const funcStr = obj.toString();
      // Try to extract JSDoc if present
      const jsdocMatch = funcStr.match(/\/\*\*([\s\S]*?)\*\//);
      if (jsdocMatch && jsdocMatch[1]) {
        return jsdocMatch[1]
          .split('\n')
          .map((line) => line.replace(/^\s*\*\s?/, '').trim())
          .join('\n')
          .trim();
      }
    }
    return null;
  }

  private getFormattedDoc(obj: unknown): string | null {
    const docs = this.getDoc(obj);
    if (!docs) {
      return null;
    }
    let formatted = docs.trim();
    if (!this.help) {
      formatted = firstParagraph(formatted);
    }
    return escapeControlCodes(formatted);
  }

  private getSignature(name: string, obj: unknown): Text | null {
    if (typeof obj !== 'function') {
      return null;
    }

    try {
      const funcStr = obj.toString();
      // Extract function signature
      const match = funcStr.match(/^(async\s+)?(function\s*)?(\w*)\s*\([^)]*\)/);
      if (match) {
        const isAsync = match[1] ? true : false;
        const funcName = match[3] || name || '';
        const prefix = isAsync ? 'async function' : 'function';
        const signature = funcStr.match(/\([^)]*\)/)?.[0] || '()';
        
        const callableName = Text.fromMarkup(`[inspect.callable]${funcName}[/]`);
        const signatureText = this.highlighter.call(signature);
        
        return Text.fromMarkup(`[inspect.${prefix.replace(' ', '_')}]${prefix} [/]`).add(callableName).add(signatureText);
      }
    } catch {
      // Ignore errors
    }

    return null;
  }

  private isCallable(value: unknown): boolean {
    return typeof value === 'function';
  }

  private isClass(value: unknown): boolean {
    return typeof value === 'function' && value.prototype && value.prototype.constructor === value;
  }

  private isModule(value: unknown): boolean {
    // In JS/TS, modules are objects with exports
    return value !== null && typeof value === 'object' && 'exports' in value;
  }

  private getKeys(obj: unknown): string[] {
    if (obj === null || obj === undefined) {
      return [];
    }
    if (typeof obj === 'object') {
      let keys = Object.keys(obj);
      
      // Filter dunder first (__)
      if (!this.dunder) {
        keys = keys.filter((key) => !key.startsWith('__'));
      }
      // Filter private (single _) - but keep dunder if dunder is enabled
      if (!this.private) {
        keys = keys.filter((key) => {
          // If it starts with __, it was already filtered above if dunder is false
          // So if we get here and it starts with __, dunder must be true, so keep it
          if (key.startsWith('__')) {
            return true; // Keep dunder if we got past the dunder filter
          }
          // Otherwise, filter single underscore
          return !key.startsWith('_');
        });
      }
      
      return keys;
    }
    return [];
  }

  private safeGetAttr(obj: unknown, attrName: string): [Error | null, unknown] {
    try {
      if (obj && typeof obj === 'object' && attrName in obj) {
        return [null, (obj as Record<string, unknown>)[attrName]];
      }
      return [new Error(`Attribute '${attrName}' not found`), null];
    } catch (error) {
      return [error instanceof Error ? error : new Error(String(error)), null];
    }
  }

  private sortItems(item: [string, [Error | null, unknown]]): [boolean, string] {
    const [key, [, value]] = item;
    return [this.isCallable(value), key.replace(/^_+/, '').toLowerCase()];
  }

  *__richConsole__(console: import('./console.js').Console, options: import('./console.js').ConsoleOptions): Generator<import('./segment.js').Segment | Text, void, unknown> {
    const renderables = this.render();
    // Render the panel which contains all the content
    if (renderables.length > 0) {
      yield* console.render(renderables[0]!, options);
    }
  }

  private render(): RenderableType[] {
    const obj = this.obj;
    const keys = this.getKeys(obj);
    const totalItems = keys.length;
    const notShownCount = totalItems - keys.length;

    const items: Array<[string, [Error | null, unknown]]> = keys.map((key) => [
      key,
      this.safeGetAttr(obj, key),
    ]);

    if (this.sort) {
      items.sort((a, b) => {
        const [sortA, keyA] = this.sortItems(a);
        const [sortB, keyB] = this.sortItems(b);
        if (sortA !== sortB) {
          return sortA ? -1 : 1;
        }
        return keyA.localeCompare(keyB);
      });
    }

    const itemsTable = new Table({ box: undefined, expand: false, showHeader: false });
    itemsTable.addColumn('', '', { justify: 'right' });
    itemsTable.addColumn('');

    const renderables: RenderableType[] = [];

    // Show signature if callable
    if (this.isCallable(obj)) {
      const signature = this.getSignature('', obj);
      if (signature) {
        renderables.push(signature);
        renderables.push(new Text(''));
      }
    }

    // Show docs
    if (this.docs) {
      const doc = this.getFormattedDoc(obj);
      if (doc) {
        const docText = this.highlighter.call(doc);
        docText.style = 'inspect.help';
        renderables.push(docText);
        renderables.push(new Text(''));
      }
    }

    // Show value if not a class/callable/module
    if (this.value && !this.isClass(obj) && !this.isCallable(obj) && !this.isModule(obj)) {
      renderables.push(
        new Panel(
          new Pretty(obj, { indentGuides: true, maxLength: 10, maxString: 60 }),
          undefined,
          { borderStyle: 'inspect.value.border' }
        )
      );
      renderables.push(new Text(''));
    }

    // Show attributes
    for (const [key, [error, value]] of items) {
      const keyStyle = key.startsWith('__') ? 'inspect.attr.dunder' : 'inspect.attr';
      const keyText = Text.fromMarkup(`[${keyStyle}]${key}[/] [inspect.equals]=[/]`);

      if (error) {
        const warning = keyText.copy();
        warning.style = 'inspect.error';
        itemsTable.addRow(warning, this.highlighter.call(String(error)));
        continue;
      }

      if (this.isCallable(value)) {
        if (!this.methods) {
          continue;
        }

        const signatureText = this.getSignature(key, value);
        if (!signatureText) {
          itemsTable.addRow(keyText, new Pretty(value, { highlighter: this.highlighter }));
        } else {
          if (this.docs) {
            const docs = this.getFormattedDoc(value);
            if (docs) {
              signatureText.add('\n');
              const doc = this.highlighter.call(docs);
              doc.style = 'inspect.doc';
              signatureText.add(doc);
            }
          }
          itemsTable.addRow(keyText, signatureText);
        }
      } else {
        itemsTable.addRow(keyText, new Pretty(value, { highlighter: this.highlighter }));
      }
    }

    if (itemsTable.rowCount > 0) {
      renderables.push(itemsTable);
    } else if (notShownCount > 0) {
      renderables.push(
        Text.fromMarkup(
          `[bold cyan]${notShownCount}[/][i] attribute(s) not shown.[/i] ` +
            `Run [b][magenta]inspect[/]([not b]inspect[/])[/b] for options.`
        )
      );
    }

    return [
      new Panel(
        new Renderables(renderables),
        undefined,
        {
          title: this.title,
          borderStyle: 'scope.border',
          padding: [0, 1],
          expand: false,
        }
      ),
    ];
  }
}

/**
 * Inspect any JavaScript/TypeScript object.
 */
export function inspect(
  obj: unknown,
  options: InspectOptions = {}
): Inspect {
  return new Inspect(obj, options);
}

