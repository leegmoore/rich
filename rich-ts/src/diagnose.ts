import { Console } from './console.js';
import { Table } from './table.js';

/**
 * Print diagnostic information about Rich configuration.
 * @param console - Optional console instance to use. If not provided, creates a new one.
 */
export function report(console?: Console): void {
  const consoleInstance = console ?? new Console();
  const table = new Table({ title: 'Rich Diagnostics', showHeader: false });
  table.addColumn('Property', '', { style: 'bold' });
  table.addColumn('Value');

  // Platform information
  const platform = typeof process !== 'undefined' ? process.platform : 'unknown';
  table.addRow('Platform', platform);

  // Terminal information
  const isTerminal = console.isTerminal;
  table.addRow('Terminal', isTerminal ? 'Yes' : 'No');

  // Color system
  const colorSystem = console.colorSystem ?? 'none';
  table.addRow('Color System', colorSystem);

  // Console dimensions
  table.addRow('Width', String(console.width));
  table.addRow('Height', String(console.height));

  // Encoding
  const encoding = console.options.encoding;
  table.addRow('Encoding', encoding);

  // Legacy Windows
  const legacyWindows = console.legacy_windows;
  table.addRow('Legacy Windows', legacyWindows ? 'Yes' : 'No');

  // Jupyter
  const isJupyter = console.isJupyter;
  table.addRow('Jupyter', isJupyter ? 'Yes' : 'No');

  // Interactive
  const isInteractive = console.isInteractive;
  table.addRow('Interactive', isInteractive ? 'Yes' : 'No');

  // Dumb Terminal
  const isDumbTerminal = console.isDumbTerminal;
  table.addRow('Dumb Terminal', isDumbTerminal ? 'Yes' : 'No');

  // No Color
  const noColor = consoleInstance.noColor;
  table.addRow('No Color', noColor ? 'Yes' : 'No');

  consoleInstance.print(table);
}

