import MarkdownIt from 'markdown-it';

import { HEAVY, SIMPLE_HEAVY } from './box.js';
import type { Console, ConsoleOptions, RenderResult } from './console.js';
import type { RenderableType } from './console.js';
import { Panel } from './panel.js';
import { Rule } from './rule.js';
import { Segment } from './segment.js';
import { Text } from './text.js';
import { Renderables } from './containers.js';
import { Style } from './style.js';
import { Syntax } from './syntax.js';
import { Table } from './table.js';
import { loopFirst } from './_loop.js';

type MarkdownToken = ReturnType<MarkdownIt['parse']>[number];

type MarkdownNodeType =
  | 'root'
  | 'paragraph'
  | 'heading'
  | 'bullet_list'
  | 'ordered_list'
  | 'list_item'
  | 'blockquote'
  | 'code_block'
  | 'hr'
  | 'image'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'th'
  | 'td'
  | 'text';

interface MarkdownNode {
  type: MarkdownNodeType;
  children?: MarkdownNode[];
  inlineTokens?: MarkdownToken[];
  level?: number;
  orderedStart?: number;
  content?: string;
  info?: string;
  attrs?: Record<string, string>;
}

export interface MarkdownOptions {
  justify?: 'left' | 'center' | 'right' | 'full';
  style?: string;
  hyperlinks?: boolean;
  inlineCodeLexer?: string;
  inlineCodeTheme?: string;
  codeTheme?: string;
}

export class Markdown {
  private readonly markdown: string;
  private readonly justify?: 'left' | 'center' | 'right' | 'full';
  private readonly style?: string;
  private readonly hyperlinks: boolean;
  private readonly markdownIt: MarkdownIt;
  private readonly codeTheme: string;

  constructor(markdown: string, options: MarkdownOptions = {}) {
    this.markdown = markdown;
    this.justify = options.justify;
    this.style = options.style;
    this.hyperlinks = options.hyperlinks ?? true;
    this.markdownIt = new MarkdownIt({ html: false, linkify: true, typographer: false })
      .enable('strikethrough')
      .enable('table');
    this.codeTheme = options.codeTheme ?? options.inlineCodeTheme ?? 'monokai';
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    for (const renderable of this.render()) {
      yield* console.render(renderable, options);
    }
  }

  private render(): RenderableType[] {
    const ast = this.buildAst();
    const renderables: RenderableType[] = [];
    for (const child of ast.children ?? []) {
      renderables.push(...this.renderNode(child));
    }
    if (this.style) {
      for (const renderable of renderables) {
        if (renderable instanceof Text && !renderable.style) {
          renderable.style = this.style;
        }
      }
    }
    return renderables;
  }

  private buildAst(): MarkdownNode {
    const tokens = this.markdownIt.parse(this.markdown, {});
    const root: MarkdownNode = { type: 'root', children: [] };
    const stack: MarkdownNode[] = [root];

    for (const token of tokens) {
      if (token.type.endsWith('_open')) {
        const node: MarkdownNode = {
          type: token.type.replace('_open', '') as MarkdownNodeType,
          children: [],
        };
        if (token.tag?.startsWith('h')) {
          node.level = Number(token.tag.slice(1));
        }
        if (node.type === 'ordered_list') {
          node.orderedStart = Number(token.attrGet('start') ?? 1);
        }
        if (token.attrs?.length) {
          node.attrs = Object.fromEntries(token.attrs);
        }
        stack.push(node);
      } else if (token.type.endsWith('_close')) {
        const node = stack.pop();
        const parent = stack[stack.length - 1];
        if (node && parent?.children) {
          parent.children.push(node);
        }
      } else if (token.type === 'inline') {
        const current = stack[stack.length - 1];
        if (current) {
          current.inlineTokens = token.children ?? [];
        }
      } else if (token.type === 'fence' || token.type === 'code_block') {
        const parent = stack[stack.length - 1];
        parent?.children?.push({
          type: 'code_block',
          content: token.content,
          info: token.info,
        });
      } else if (token.type === 'hr') {
        stack[stack.length - 1]?.children?.push({ type: 'hr' });
      } else if (token.type === 'image') {
        stack[stack.length - 1]?.children?.push({
          type: 'image',
          attrs: {
            src: token.attrGet('src') ?? '',
            alt: token.content ?? '',
          },
        });
      }
    }

    return root;
  }

  private renderNode(node: MarkdownNode): RenderableType[] {
    switch (node.type) {
      case 'paragraph':
        return [this.renderParagraph(node)];
      case 'heading':
        return this.renderHeading(node);
      case 'bullet_list':
        return this.renderList(node, false);
      case 'ordered_list':
        return this.renderList(node, true);
      case 'blockquote':
        return [this.renderBlockQuote(node)];
      case 'code_block':
        return [this.renderCodeBlock(node)];
      case 'hr':
        return [new Rule('', { style: 'markdown.hr' })];
      case 'image':
        return [this.renderImage(node)];
      case 'table':
        return [this.renderTable(node)];
      default:
        return [];
    }
  }

  private renderParagraph(node: MarkdownNode): Text {
    const text = this.inlineTokensToText(node.inlineTokens);
    text.justify = this.justify ?? 'left';
    if (!text.style) {
      text.style = 'markdown.paragraph';
    }
    // Ensure paragraph ends with newline so block elements like horizontal rules start on new line
    if (!text.end || text.end === '') {
      text.end = '\n';
    }
    return text;
  }

  private renderHeading(node: MarkdownNode): RenderableType[] {
    const level = node.level ?? 1;
    const text = this.inlineTokensToText(node.inlineTokens);
    text.justify = 'center';
    text.style = `markdown.h${Math.min(level, 6)}`;
    if (level === 1) {
      return [new Panel(text, HEAVY, { style: 'markdown.h1.border' })];
    }
    // For h2 and beyond, add a blank line before the heading (like Python)
    if (level === 2) {
      return [new Text(''), text];
    }
    return [text];
  }

  private renderList(node: MarkdownNode, ordered: boolean): RenderableType[] {
    const items = node.children ?? [];
    if (items.length === 0) {
      return [];
    }
    const renderedItems = items.map((item) => {
      const contentNodes = item.children ?? [];
      const renderables: RenderableType[] = [];
      const hasParagraphChild = contentNodes.some((child) => child.type === 'paragraph');
      if (contentNodes.length === 0) {
        if ((item.inlineTokens?.length ?? 0) > 0) {
          renderables.push(this.inlineTokensToText(item.inlineTokens));
        }
      } else {
        if (!hasParagraphChild && (item.inlineTokens?.length ?? 0) > 0) {
          renderables.push(this.inlineTokensToText(item.inlineTokens));
        }
        for (const child of contentNodes) {
          renderables.push(...this.renderNode(child));
        }
      }
      if (renderables.length === 0) {
        renderables.push(new Text(''));
      }
      return renderables;
    });
    const startIndex = ordered ? (node.orderedStart ?? 1) : 1;
    return [new MarkdownListRenderable(renderedItems, ordered, startIndex)];
  }

  private renderBlockQuote(node: MarkdownNode): RenderableType {
    const children = (node.children ?? []).flatMap((child) => this.renderNode(child));
    return new BlockQuoteRenderable(children, 'markdown.block_quote');
  }

  private renderCodeBlock(node: MarkdownNode): RenderableType {
    const code = (node.content ?? '').replace(/\s+$/u, '');
    const lexerInfo = (node.info ?? '').trim();
    const lexerCandidate = lexerInfo.split(/\s+/)[0]?.trim();
    const lexer = lexerCandidate && lexerCandidate.length > 0 ? lexerCandidate : 'text';
    const syntax = new Syntax(code, lexer, {
      theme: this.codeTheme,
      wordWrap: true,
      padding: 1,
    });
    return new CodeBlockRenderable(syntax, 'markdown.code_block');
  }

  private renderImage(node: MarkdownNode): RenderableType {
    const alt = node.attrs?.alt ?? node.attrs?.src ?? '';
    return Text.fromMarkup(`[markdown.link]🌆 ${escapeMarkup(alt)}[/]`, { emoji: true });
  }

  private renderTable(node: MarkdownNode): RenderableType {
    const table = new Table({ box: SIMPLE_HEAVY });
    const headerRows = this.getTableRows(node, 'thead');
    const bodyRows = this.getTableRows(node, 'tbody');
    const directRows = this.getTableRows(node, null);

    const effectiveBody = bodyRows.length ? bodyRows : directRows;

    if (headerRows.length > 0) {
      const header = headerRows[0] ?? [];
      header.forEach((cell) => table.addColumn(cell));
      table.showHeader = true;
      for (const row of headerRows.slice(1)) {
        table.addRow(...row);
      }
    } else {
      table.showHeader = false;
      const firstBody = effectiveBody[0] ?? [];
      if (firstBody.length === 0) {
        table.addColumn('');
      } else {
        firstBody.forEach(() => table.addColumn(''));
      }
    }

    for (const row of effectiveBody) {
      table.addRow(...row);
    }

    return table;
  }

  private getTableRows(node: MarkdownNode, sectionType: MarkdownNodeType | null): Text[][] {
    const rows: Text[][] = [];
    const children = node.children ?? [];
    if (sectionType === null) {
      for (const child of children) {
        if (child.type === 'tr') {
          rows.push(this.getTableCells(child));
        }
      }
      return rows;
    }
    for (const child of children) {
      if (child.type === sectionType) {
        rows.push(...this.getTableRows(child, null));
      }
    }
    return rows;
  }

  private getTableCells(rowNode: MarkdownNode): Text[] {
    const cells: Text[] = [];
    for (const cell of rowNode.children ?? []) {
      if (cell.type !== 'th' && cell.type !== 'td') continue;
      const text = this.inlineTokensToText(cell.inlineTokens);
      const alignment = cell.attrs?.style ?? '';
      if (alignment.includes('text-align:right')) {
        text.justify = 'right';
      } else if (alignment.includes('text-align:center')) {
        text.justify = 'center';
      } else if (alignment.includes('text-align:left')) {
        text.justify = 'left';
      }
      cells.push(text);
    }
    return cells.length ? cells : [new Text('')];
  }

  private inlineTokensToText(tokens: MarkdownToken[] | undefined): Text {
    if (!tokens || tokens.length === 0) {
      return new Text('');
    }
    const markup = this.inlineTokensToMarkup(tokens);
    const text = Text.fromMarkup(markup, { emoji: true });
    text.end = '';
    return text;
  }

  private inlineTokensToMarkup(tokens: MarkdownToken[]): string {
    const parts: string[] = [];
    const linkStack: string[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          parts.push(escapeMarkup(token.content ?? ''));
          break;
        case 'softbreak':
        case 'hardbreak':
          parts.push('\n');
          break;
        case 'code_inline':
          parts.push(`[markdown.code]${escapeMarkup(token.content ?? '')}[/]`);
          break;
        case 'strong_open':
          parts.push('[markdown.strong]');
          break;
        case 'strong_close':
          parts.push('[/]');
          break;
        case 'em_open':
          parts.push('[markdown.em]');
          break;
        case 'em_close':
          parts.push('[/]');
          break;
        case 's_open':
          parts.push('[markdown.s]');
          break;
        case 's_close':
          parts.push('[/]');
          break;
        case 'link_open': {
          const href = token.attrGet('href') ?? '';
          linkStack.push(href);
          parts.push('[markdown.link]');
          if (this.hyperlinks && href) {
            parts.push(`[link=${escapeMarkup(href)}]`);
          }
          break;
        }
        case 'link_close': {
          const href = linkStack.pop();
          if (href && this.hyperlinks) {
            parts.push('[/link]');
          }
          parts.push('[/]');
          if (href && !this.hyperlinks) {
            parts.push(` ([markdown.link_url]${escapeMarkup(href)}[/])`);
          }
          break;
        }
        case 'html_inline':
          parts.push(escapeMarkup(token.content ?? ''));
          break;
        case 'image': {
          const alt =
            token.children?.map((child: MarkdownToken) => child.content).join('') ??
            token.content ??
            '';
          parts.push(`[markdown.link]🌆 ${escapeMarkup(alt ?? token.attrGet('src') ?? '')}[/]`);
          break;
        }
        default:
          if (token.content) {
            parts.push(escapeMarkup(token.content));
          }
      }
    }

    return parts.join('');
  }
}

class BlockQuoteRenderable {
  constructor(
    private readonly children: RenderableType[],
    private readonly styleName: string
  ) {}

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const style = console.getStyle(this.styleName, Style.null());
    const lines = console.renderLines(
      new Renderables(this.children),
      options.update({ height: undefined }),
      style,
      true
    );
    const prefix = new Segment('▌ ', style);
    const newLine = Segment.line();
    for (const line of lines) {
      yield prefix;
      yield* line;
      yield newLine;
    }
  }
}

class CodeBlockRenderable {
  constructor(
    private readonly syntax: Syntax,
    private readonly styleName: string
  ) {}

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    // Get the markdown.code_block style (yellow foreground, black background)
    const codeBlockStyle = console.getStyle(this.styleName, Style.null());
    // Render the syntax with the code block style applied
    // This ensures the code block has the yellow color from markdown.code_block
    const lines = console.renderLines(
      this.syntax,
      options.update({ height: undefined }),
      codeBlockStyle,
      true // apply style to background
    );
    const newLine = Segment.line();
    for (const line of lines) {
      yield* line;
      yield newLine;
    }
  }
}

class MarkdownListRenderable {
  constructor(
    private readonly items: RenderableType[][],
    private readonly ordered: boolean,
    private readonly startIndex: number
  ) {}

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    if (!this.items.length) {
      return;
    }
    const itemStyle = console.getStyle('markdown.item', Style.null());
    if (this.ordered) {
      yield* this.renderOrdered(console, options, itemStyle);
    } else {
      yield* this.renderBulleted(console, options, itemStyle);
    }
  }

  private renderItemLines(
    console: Console,
    renderables: RenderableType[],
    options: ConsoleOptions,
    style: Style
  ): Segment[][] {
    const lines: Segment[][] = [];
    for (const renderable of renderables) {
      const rendered = console.renderLines(renderable, options, style, true);
      lines.push(...rendered);
    }
    return lines.length ? lines : [[]];
  }

  private *renderBulleted(console: Console, options: ConsoleOptions, style: Style): RenderResult {
    const bulletWidth = 3;
    const renderOptions = options.update({
      width: Math.max(1, options.maxWidth - bulletWidth),
      height: undefined,
    });
    const bulletStyle = console.getStyle('markdown.item.bullet', Style.null());
    const bullet = new Segment(' • ', bulletStyle);
    const padding = new Segment(' '.repeat(bulletWidth), bulletStyle);
    const newLine = Segment.line();
    for (const renderables of this.items) {
      const lines = this.renderItemLines(console, renderables, renderOptions, style);
      for (const [isFirst, line] of loopFirst(lines)) {
        yield isFirst ? bullet : padding;
        yield* line;
        yield newLine;
      }
    }
  }

  private *renderOrdered(console: Console, options: ConsoleOptions, style: Style): RenderResult {
    const lastNumber = this.startIndex + this.items.length - 1;
    const numberWidth = Math.max(3, String(lastNumber).length + 2);
    const renderOptions = options.update({
      width: Math.max(1, options.maxWidth - numberWidth),
      height: undefined,
    });
    const numberStyle = console.getStyle('markdown.item.number', Style.null());
    const newLine = Segment.line();
    const padding = new Segment(' '.repeat(numberWidth), numberStyle);
    let currentNumber = this.startIndex;
    for (const renderables of this.items) {
      const numeral = new Segment(
        `${String(currentNumber).padStart(numberWidth - 1)} `,
        numberStyle
      );
      const lines = this.renderItemLines(console, renderables, renderOptions, style);
      for (const [isFirst, line] of loopFirst(lines)) {
        yield isFirst ? numeral : padding;
        yield* line;
        yield newLine;
      }
      currentNumber += 1;
    }
  }
}

const escapeMarkup = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
