import type { ConsoleRenderable } from './console.js';
import { ReprHighlighter } from './highlighter.js';
import { Panel } from './panel.js';
import { Pretty } from './pretty.js';
import { Table } from './table.js';
import { Text } from './text.js';

/**
 * Render JavaScript variables in a given scope.
 *
 * @param scope - A mapping containing variable names and values
 * @param options - Rendering options
 * @param options.title - Optional title
 * @param options.sortKeys - Enable sorting of items. Defaults to true
 * @param options.indentGuides - Enable indentation guides. Defaults to false
 * @param options.maxLength - Maximum length of containers before abbreviating, or null for no abbreviation
 * @param options.maxString - Maximum length of string before truncating, or null to disable
 * @returns A renderable object
 */
export function renderScope(
  scope: Record<string, unknown>,
  options: {
    title?: string | Text;
    sortKeys?: boolean;
    indentGuides?: boolean;
    maxLength?: number | null;
    maxString?: number | null;
  } = {}
): ConsoleRenderable {
  const highlighter = new ReprHighlighter();
  const itemsTable = new Table({ box: undefined, expand: false, showHeader: false });
  itemsTable.addColumn('', '', { justify: 'right' });
  itemsTable.addColumn('');

  const sortItems = (item: [string, unknown]): [boolean, string] => {
    const [key] = item;
    return [!key.startsWith('__'), key.toLowerCase()];
  };

  const items = options.sortKeys !== false
    ? Object.entries(scope).sort((a, b) => {
        const [sortA, keyA] = sortItems(a);
        const [sortB, keyB] = sortItems(b);
        if (sortA !== sortB) {
          return sortA ? -1 : 1;
        }
        return keyA.localeCompare(keyB);
      })
    : Object.entries(scope);

  for (const [key, value] of items) {
    const keyStyle = key.startsWith('__') ? 'scope.key.special' : 'scope.key';
    const keyText = Text.fromMarkup(`[${keyStyle}]${escapeMarkup(key)}[/] [scope.equals]=[/]`, {
      emoji: false,
    });
    const valueText = new Pretty(value, {
      maxLength: options.maxLength ?? undefined,
      maxString: options.maxString ?? undefined,
      indentGuides: options.indentGuides ?? false,
      highlighter,
    });
    itemsTable.addRow(keyText, valueText);
  }

  if (options.title) {
    return new Panel(itemsTable, undefined, {
      title: options.title,
      borderStyle: 'scope.border',
      padding: [0, 1],
      expand: false,
    });
  }

  return itemsTable;
}

function escapeMarkup(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

