/**
 * Tests for theme module
 * Based on tests/test_theme.py
 */
import { describe, it, expect } from 'vitest';
import { Style } from '../src/style';
import { Theme, ThemeStack, ThemeStackError } from '../src/theme';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, writeFile, rm } from 'fs/promises';

describe('theme', () => {
  it('test_inherit', () => {
    const theme = new Theme({ warning: 'red' });
    expect(theme.styles['warning']).toEqual(Style.parse('red'));
    expect(theme.styles['dim']).toEqual(new Style({ dim: true }));
  });

  it('test_config', () => {
    const theme = new Theme({ warning: 'red' });
    const config = theme.config;
    expect(config).toContain('warning = red\n');
  });

  it('test_from_file', () => {
    const theme = new Theme({ warning: 'red' });
    const configText = theme.config;

    const loadTheme = Theme.fromFile(configText);

    // Check that both have the same style names
    expect(Object.keys(loadTheme.styles).sort()).toEqual(Object.keys(theme.styles).sort());

    // Check that warning style matches
    expect(loadTheme.styles['warning']).toEqual(Style.parse('red'));
  });

  it('test_read', async () => {
    const theme = new Theme({ warning: 'red' });

    // Create temporary directory
    const tempDir = await mkdtemp(join(tmpdir(), 'richtheme-'));
    const filename = join(tempDir, 'theme.cfg');

    try {
      // Write theme config
      await writeFile(filename, theme.config, 'utf-8');

      // Read theme
      const loadTheme = await Theme.read(filename);

      // Check that both have the same style names
      expect(Object.keys(loadTheme.styles).sort()).toEqual(Object.keys(theme.styles).sort());

      // Check that warning style matches
      expect(loadTheme.styles['warning']).toEqual(Style.parse('red'));
    } finally {
      // Cleanup
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('test_theme_stack', () => {
    const theme = new Theme({ warning: 'red' });
    const stack = new ThemeStack(theme);
    expect(stack.get('warning')).toEqual(Style.parse('red'));

    const newTheme = new Theme({ warning: 'bold yellow' });
    stack.pushTheme(newTheme);
    expect(stack.get('warning')).toEqual(Style.parse('bold yellow'));

    stack.popTheme();
    expect(stack.get('warning')).toEqual(Style.parse('red'));

    expect(() => stack.popTheme()).toThrow(ThemeStackError);
  });
});
