/**
 * Markup - Console markup parser and renderer
 */
import { _emoji_replace } from './_emoji_replace.js';
import { MarkupError } from './errors.js';
import { Style, StyleType } from './style.js';
import { Span, Text } from './text.js';

// Regex to match markup tags
export const RE_TAGS = /((\\*)\[([a-z#/@][^\[]*?)])/g;

// Regex to parse handler syntax
const RE_HANDLER = /^([\w.]*?)(\(.*?\))?$/;

/**
 * A tag in console markup
 */
export class Tag {
  name: string;
  parameters: string | null;

  constructor(name: string, parameters: string | null) {
    this.name = name;
    this.parameters = parameters;
  }

  toString(): string {
    return this.parameters === null ? this.name : `${this.name} ${this.parameters}`;
  }

  get markup(): string {
    return this.parameters === null ? `[${this.name}]` : `[${this.name}=${this.parameters}]`;
  }
}

/**
 * Escapes text so it won't be interpreted as markup
 */
export function escape(markup: string): string {
  const escapeRegex = /(\\*)(\[[a-z#/@][^\[]*?])/g;

  function escapeBackslashes(match: string, backslashes: string, text: string): string {
    return `${backslashes}${backslashes}\\${text}`;
  }

  let result = markup.replace(escapeRegex, escapeBackslashes);

  // Handle trailing backslash
  if (result.endsWith('\\') && !result.endsWith('\\\\')) {
    result += '\\';
  }

  return result;
}

/**
 * Parse markup into tuples of (position, text, tag)
 */
export function* _parse(markup: string): Generator<[number, string | null, Tag | null]> {
  let position = 0;
  RE_TAGS.lastIndex = 0; // Reset regex state

  let match: RegExpExecArray | null;
  while ((match = RE_TAGS.exec(markup)) !== null) {
    const [fullText, , escapes, tagText] = match;
    const start = match.index;
    const end = start + fullText.length;

    // Yield any text before this match
    if (start > position) {
      yield [start, markup.substring(position, start), null];
    }

    if (escapes) {
      const backslashCount = escapes.length;
      const backslashes = Math.floor(backslashCount / 2);
      const escaped = backslashCount % 2 === 1;

      if (backslashes > 0) {
        // Literal backslashes
        yield [start, '\\'.repeat(backslashes), null];
      }

      if (escaped) {
        // Escaped tag - treat as literal
        yield [start + backslashes * 2, fullText.substring(escapes.length), null];
        position = end;
        continue;
      }
    }

    // Parse tag
    const equalsIndex = tagText.indexOf('=');
    let name: string, parameters: string | null;
    if (equalsIndex === -1) {
      name = tagText;
      parameters = null;
    } else {
      name = tagText.substring(0, equalsIndex);
      parameters = tagText.substring(equalsIndex + 1);
    }

    yield [start, null, new Tag(name, parameters)];
    position = end;
  }

  // Yield any remaining text
  if (position < markup.length) {
    yield [position, markup.substring(position), null];
  }
}

/**
 * Render console markup into a Text instance
 */
export function render(
  markup: string,
  style: StyleType = '',
  emoji: boolean = true,
  emojiVariant?: 'text' | 'emoji'
): Text {
  // Fast path for no markup
  if (!markup.includes('[')) {
    return new Text(emoji ? _emoji_replace(markup, emojiVariant) : markup, style);
  }

  const text = new Text('', style);
  const normalize = Style.normalize;

  const styleStack: Array<[number, Tag]> = [];
  const spans: Span[] = [];

  function popStyle(styleName: string): [number, Tag] {
    for (let i = styleStack.length - 1; i >= 0; i--) {
      const [, tag] = styleStack[i]!;
      if (tag.name === styleName) {
        const result = styleStack[i]!;
        styleStack.splice(i, 1);
        return result;
      }
    }
    throw new Error(`No matching tag for ${styleName}`);
  }

  for (const [position, plainText, tag] of _parse(markup)) {
    if (plainText !== null) {
      // Handle escaped brackets
      const unescapedText = plainText.replace(/\\\[/g, '[');
      text.append(emoji ? _emoji_replace(unescapedText) : unescapedText);
    } else if (tag !== null) {
      if (tag.name.startsWith('/')) {
        // Closing tag
        const styleName = tag.name.substring(1).trim();

        let start: number, openTag: Tag;
        if (styleName) {
          // Explicit close
          const normalizedName = normalize(styleName);
          try {
            [start, openTag] = popStyle(normalizedName);
          } catch {
            throw new MarkupError(
              `closing tag '${tag.markup}' at position ${position} doesn't match any open tag`
            );
          }
        } else {
          // Implicit close [/]
          if (styleStack.length === 0) {
            throw new MarkupError(
              `closing tag '[/]' at position ${position} has nothing to close`
            );
          }
          [start, openTag] = styleStack.pop()!;
        }

        // Handle meta tags (@)
        if (openTag.name.startsWith('@')) {
          let metaParams: unknown = [];

          if (openTag.parameters) {
            let handlerName = '';
            const parameters = openTag.parameters.trim();
            const handlerMatch = RE_HANDLER.exec(parameters);

            let paramsStr: string;
            if (handlerMatch) {
              [, handlerName = '', ] = handlerMatch;
              let matchParameters = handlerMatch[2];
              paramsStr = matchParameters === undefined ? '()' : matchParameters;
            } else {
              // Regex didn't match - try to parse parameters directly
              paramsStr = parameters;
            }

            try {
              // Use JSON.parse for simple parameter parsing
              // Convert Python tuple syntax to array syntax
              let jsonStr = paramsStr
                .replace(/'/g, '"')
                .replace(/\(/g, '[')
                .replace(/\)/g, ']')
                .replace(/None/g, 'null')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false');

              // If it's comma-separated values without brackets, wrap in array
              if (!jsonStr.trim().startsWith('[') && jsonStr.includes(',')) {
                jsonStr = `[${jsonStr}]`;
              }

              metaParams = JSON.parse(jsonStr);
            } catch (error) {
              throw new MarkupError(
                `error parsing '${paramsStr}'; ${(error as Error).message}`
              );
            }

            if (handlerName) {
              metaParams = [
                handlerName,
                Array.isArray(metaParams) ? metaParams : [metaParams],
              ];
            }
          }

          spans.push(new Span(start, text.length, new Style({ meta: { [openTag.name]: metaParams } })));
        } else {
          spans.push(new Span(start, text.length, openTag.toString()));
        }
      } else {
        // Opening tag
        const normalizedTag = new Tag(normalize(tag.name), tag.parameters);
        styleStack.push([text.length, normalizedTag]);
      }
    }
  }

  // Close any remaining open tags
  const textLength = text.length;
  while (styleStack.length > 0) {
    const [start, tag] = styleStack.pop()!;
    const styleStr = tag.toString();
    if (styleStr) {
      spans.push(new Span(start, textLength, styleStr));
    }
  }

  // Sort spans (reversed then by start position)
  text.spans = spans.reverse().sort((a, b) => a.start - b.start);
  return text;
}
