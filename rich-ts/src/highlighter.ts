import { Text, Span } from './text.js';
import type { TextType } from './text.js';

const BACKTICK = '`';
const combineRegex = (...regexes: string[]): string => regexes.join('|');

const REPR_PATTERN_STRINGS = [
  String.raw`(?<tag_start><)(?<tag_name>[-\w.:|]*)(?<tag_contents>[\w\W]*)(?<tag_end>>)`,
  String.raw`(?<attrib_name>[\w_]{1,50})=(?<attrib_value>"?[\w_]+"?)?`,
  String.raw`(?<brace>[\[\]{}()])`,
  combineRegex(
    String.raw`(?<ipv4>[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})`,
    String.raw`(?<ipv6>([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})`,
    String.raw`(?<eui64>(?:[0-9A-Fa-f]{1,2}-){7}[0-9A-Fa-f]{1,2}|(?:[0-9A-Fa-f]{1,2}:){7}[0-9A-Fa-f]{1,2}|(?:[0-9A-Fa-f]{4}\.){3}[0-9A-Fa-f]{4})`,
    String.raw`(?<eui48>(?:[0-9A-Fa-f]{1,2}-){5}[0-9A-Fa-f]{1,2}|(?:[0-9A-Fa-f]{1,2}:){5}[0-9A-Fa-f]{1,2}|(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4})`,
    String.raw`(?<uuid>[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})`,
    String.raw`(?<call>[\w.]*?)\(`,
    String.raw`\b(?<bool_true>True)\b|\b(?<bool_false>False)\b|\b(?<none>None)\b`,
    String.raw`(?<ellipsis>\.\.\.)`,
    String.raw`(?<number_complex>(?<!\w)(?:-?[0-9]+\.?[0-9]*(?:e[-+]?\d+?)?)(?:[-+](?:[0-9]+\.?[0-9]*(?:e[-+]?\d+)?))?j)`,
    String.raw`(?<number>(?<!\w)-?[0-9]+\.?[0-9]*(e[-+]?\d+?)?\b|0x[0-9a-fA-F]*)`,
    String.raw`(?<path>\B(/[-\w._+]+)*\/)(?<filename>[-\w._+]*)?`,
    String.raw`(?<![\\\w])(?<str>b?'''.*?(?<!\\)'''|b?'.*?(?<!\\)'|b?""".*?(?<!\\)"""|b?".*?(?<!\\)")`,
    String.raw`(?<url>(file|https|http|ws|wss)://[-0-9a-zA-Z$_+!${BACKTICK}(),.?/;:&=%#~@]*)`
  ),
];

const JSON_STRING_PATTERN = String.raw`(?<![\\\w])(?<str>b?".*?(?<!\\)")`;

const JSON_PATTERN_STRINGS = [
  combineRegex(
    String.raw`(?<brace>[\{\[\(\)\]\}])`,
    String.raw`\b(?<bool_true>true)\b|\b(?<bool_false>false)\b|\b(?<null>null)\b`,
    String.raw`(?<number>(?<!\w)-?[0-9]+\.?[0-9]*(e[\-\+]?\d+?)?\b|0x[0-9a-fA-F]*)`,
    JSON_STRING_PATTERN
  ),
];

const ISO_PATTERN_STRINGS = [
  String.raw`^(?<year>[0-9]{4})-(?<month>1[0-2]|0[1-9])$`,
  String.raw`^(?<date>(?<year>[0-9]{4})(?<month>1[0-2]|0[1-9])(?<day>3[01]|0[1-9]|[12][0-9]))$`,
  String.raw`^(?<date>(?<year>[0-9]{4})-?(?<day>36[0-6]|3[0-5][0-9]|[12][0-9]{2}|0[1-9][0-9]|00[1-9]))$`,
  String.raw`^(?<date>(?<year>[0-9]{4})-?W(?<week>5[0-3]|[1-4][0-9]|0[1-9]))$`,
  String.raw`^(?<date>(?<year>[0-9]{4})-?W(?<week>5[0-3]|[1-4][0-9]|0[1-9])-?(?<day>[1-7]))$`,
  String.raw`^(?<time>(?<hour>2[0-3]|[01][0-9]):?(?<minute>[0-5][0-9]))$`,
  String.raw`^(?<time>(?<hour>2[0-3]|[01][0-9])(?<minute>[0-5][0-9])(?<second>[0-5][0-9]))$`,
  String.raw`^(?<timezone>(Z|[+-](?:2[0-3]|[01][0-9])(?::?(?:[0-5][0-9]))?))$`,
  String.raw`^(?<time>(?<hour>2[0-3]|[01][0-9])(?<minute>[0-5][0-9])(?<second>[0-5][0-9]))(?<timezone>Z|[+-](?:2[0-3]|[01][0-9])(?::?(?:[0-5][0-9]))?)$`,
  String.raw`^(?<date>(?<year>[0-9]{4})(?<hyphen>-)?(?<month>1[0-2]|0[1-9])(?(hyphen)-)(?<day>3[01]|0[1-9]|[12][0-9])) (?<time>(?<hour>2[0-3]|[01][0-9])(?(hyphen):)(?<minute>[0-5][0-9])(?(hyphen):)(?<second>[0-5][0-9]))$`,
  String.raw`^(?<date>(?<year>-?(?:[1-9][0-9]*)?[0-9]{4})-(?<month>1[0-2]|0[1-9])-(?<day>3[01]|0[1-9]|[12][0-9]))(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$`,
  String.raw`^(?<time>(?<hour>2[0-3]|[01][0-9]):(?<minute>[0-5][0-9]):(?<second>[0-5][0-9])(?<frac>\.[0-9]+)?)(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$`,
  String.raw`^(?<date>(?<year>-?(?:[1-9][0-9]*)?[0-9]{4})-(?<month>1[0-2]|0[1-9])-(?<day>3[01]|0[1-9]|[12][0-9]))T(?<time>(?<hour>2[0-3]|[01][0-9]):(?<minute>[0-5][0-9]):(?<second>[0-5][0-9])(?<ms>\.[0-9]+)?)(?<timezone>Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$`,
];

const replaceAllLiteral = (text: string, search: string, replacement: string): string =>
  text.split(search).join(replacement);

const expandHyphenConditionals = (pattern: string): string[] => {
  if (!pattern.includes('(?<hyphen>')) {
    return [pattern];
  }
  const withHyphenGroup = replaceAllLiteral(pattern, '(?<hyphen>-)?', '(?<hyphen>-)');
  const withHyphen = replaceAllLiteral(
    replaceAllLiteral(withHyphenGroup, '(?(hyphen)-)', '-'),
    '(?(hyphen):)',
    ':'
  );
  const withoutHyphenGroup = replaceAllLiteral(pattern, '(?<hyphen>-)?', '');
  const withoutHyphen = replaceAllLiteral(
    replaceAllLiteral(withoutHyphenGroup, '(?(hyphen)-)', ''),
    '(?(hyphen):)',
    ''
  );
  return [withHyphen, withoutHyphen];
};

const ISO_PATTERNS = ISO_PATTERN_STRINGS.flatMap(expandHyphenConditionals);

const JSON_WHITESPACE = new Set([' ', '\n', '\r', '\t']);

export abstract class Highlighter {
  call(text: TextType): Text {
    if (typeof text === 'string') {
      const highlightText = new Text(text);
      this.highlight(highlightText);
      return highlightText;
    }
    if (text instanceof Text) {
      const highlightText = text.copy();
      this.highlight(highlightText);
      return highlightText;
    }
    throw new TypeError(`str or Text instance required, not ${String(text)}`);
  }

  abstract highlight(text: Text): void;
}

export class NullHighlighter extends Highlighter {
  highlight(_text: Text): void {
    // no-op
  }
}

export class RegexHighlighter extends Highlighter {
  protected highlights: string[] = [];
  protected baseStyle = '';

  highlight(text: Text): void {
    for (const pattern of this.highlights) {
      const regex = new RegExp(pattern, 'gu');
      text.highlightRegex(regex, undefined, { stylePrefix: this.baseStyle });
    }
  }
}

export class ReprHighlighter extends RegexHighlighter {
  protected baseStyle = 'repr.';
  protected highlights = REPR_PATTERN_STRINGS;
}

export class JSONHighlighter extends RegexHighlighter {
  protected baseStyle = 'json.';
  protected highlights = JSON_PATTERN_STRINGS;

  highlight(text: Text): void {
    super.highlight(text);

    const plain = text.plain;
    const regex = new RegExp(JSON_STRING_PATTERN, 'gu');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(plain)) !== null) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      let cursor = end;
      while (cursor < plain.length) {
        const char = plain[cursor];
        if (char === undefined) {
          break;
        }
        cursor += 1;
        if (char === ':') {
          text.spans.push(new Span(start, end, 'json.key'));
          break;
        }
        if (JSON_WHITESPACE.has(char)) {
          continue;
        }
        break;
      }
    }
  }
}

export class ISO8601Highlighter extends RegexHighlighter {
  protected baseStyle = 'iso8601.';
  protected highlights = ISO_PATTERNS;
}

export default Highlighter;
