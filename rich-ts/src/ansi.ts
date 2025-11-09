/* eslint-disable no-control-regex */

import { Color } from './color.js';
import { Style } from './style.js';
import { Text } from './text.js';

interface AnsiToken {
  plain: string;
  sgr?: string;
  osc?: string;
}

const RE_ANSI = new RegExp(
  '(?:\\x1b[0-?])|(?:\\x1b\\](.*?)\\x1b\\\\)|(?:\\x1b([(@-Z\\\\-_]|\\[[0-?]*[ -/]*[@-~]))',
  'g'
);

const SGR_STYLE_MAP: Record<number, string> = {
  1: 'bold',
  2: 'dim',
  3: 'italic',
  4: 'underline',
  5: 'blink',
  6: 'blink2',
  7: 'reverse',
  8: 'conceal',
  9: 'strike',
  21: 'underline2',
  22: 'not dim not bold',
  23: 'not italic',
  24: 'not underline',
  25: 'not blink',
  26: 'not blink2',
  27: 'not reverse',
  28: 'not conceal',
  29: 'not strike',
  30: 'color(0)',
  31: 'color(1)',
  32: 'color(2)',
  33: 'color(3)',
  34: 'color(4)',
  35: 'color(5)',
  36: 'color(6)',
  37: 'color(7)',
  39: 'default',
  40: 'on color(0)',
  41: 'on color(1)',
  42: 'on color(2)',
  43: 'on color(3)',
  44: 'on color(4)',
  45: 'on color(5)',
  46: 'on color(6)',
  47: 'on color(7)',
  49: 'on default',
  51: 'frame',
  52: 'encircle',
  53: 'overline',
  54: 'not frame not encircle',
  55: 'not overline',
  90: 'color(8)',
  91: 'color(9)',
  92: 'color(10)',
  93: 'color(11)',
  94: 'color(12)',
  95: 'color(13)',
  96: 'color(14)',
  97: 'color(15)',
  100: 'on color(8)',
  101: 'on color(9)',
  102: 'on color(10)',
  103: 'on color(11)',
  104: 'on color(12)',
  105: 'on color(13)',
  106: 'on color(14)',
  107: 'on color(15)',
};

const ANSI_LINE_BREAK = new RegExp('\\r\\n|[\\n\\r\\v\\f\\x1c-\\x1e\\x85\\u2028\\u2029]', 'g');
const TRAILING_LINE_BREAK = new RegExp('(?:\\r\\n|[\\n\\r\\v\\f\\x1c-\\x1e\\x85\\u2028\\u2029])$');

function* ansiTokenize(ansiText: string): Generator<AnsiToken> {
  const regex = new RegExp(RE_ANSI.source, RE_ANSI.flags);
  let position = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(ansiText)) !== null) {
    const [fullMatch, osc, sgr] = match;
    const start = match.index;
    const end = start + fullMatch.length;

    if (start > position) {
      yield { plain: ansiText.slice(position, start) };
    }

    if (sgr) {
      if (sgr === '(') {
        position = end + 1;
        continue;
      }
      if (sgr.endsWith('m')) {
        yield { plain: '', sgr: sgr.slice(1, -1), osc: osc ?? undefined };
      }
    } else {
      yield { plain: '', sgr: undefined, osc: osc ?? undefined };
    }

    position = end;
  }

  if (position < ansiText.length) {
    yield { plain: ansiText.slice(position) };
  }
}

function splitLines(text: string): string[] {
  if (text === '') {
    return [];
  }

  const separator = new RegExp(ANSI_LINE_BREAK.source, ANSI_LINE_BREAK.flags);
  const lines = text.split(separator);
  const hasTrailingNewline = TRAILING_LINE_BREAK.test(text);

  if (hasTrailingNewline && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

function stripCarriageReturn(line: string): string {
  const carriageIndex = line.lastIndexOf('\r');
  return carriageIndex === -1 ? line : line.slice(carriageIndex + 1);
}

function isDigitOrEmpty(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

function clampCode(value: string): number {
  if (value === '') {
    return 0;
  }
  return Math.min(255, Number.parseInt(value, 10));
}

export class AnsiDecoder {
  private style: Style;

  constructor() {
    this.style = Style.null();
  }

  *decode(terminalText: string): Generator<Text> {
    for (const line of splitLines(terminalText)) {
      yield this.decodeLine(line);
    }
  }

  decodeLine(line: string): Text {
    const text = new Text();
    const append = text.append.bind(text);
    const sanitizedLine = stripCarriageReturn(line);

    for (const token of ansiTokenize(sanitizedLine)) {
      if (token.plain) {
        append(token.plain, this.style.isNull ? undefined : this.style);
      } else if (token.osc !== undefined) {
        this.handleOsc(token.osc);
      } else if (token.sgr !== undefined) {
        this.applySgrCodes(token.sgr);
      }
    }

    return text;
  }

  private handleOsc(osc: string): void {
    if (!osc.startsWith('8;')) {
      return;
    }
    const payload = osc.slice(2);
    const separatorIndex = payload.indexOf(';');
    if (separatorIndex === -1) {
      return;
    }
    const link = payload.slice(separatorIndex + 1) || undefined;
    this.style = this.style.updateLink(link);
  }

  private applySgrCodes(sgr: string): void {
    const codes = sgr.split(';').filter(isDigitOrEmpty).map(clampCode);

    for (let index = 0; index < codes.length; index += 1) {
      const code = codes[index];
      if (code === undefined) {
        continue;
      }

      if (code === 0) {
        this.style = Style.null();
        continue;
      }

      const mappedStyle = SGR_STYLE_MAP[code];
      if (mappedStyle !== undefined) {
        this.style = this.style.add(Style.parse(mappedStyle));
        continue;
      }

      if (code === 38) {
        index = this.applyExtendedColor(codes, index, true);
      } else if (code === 48) {
        index = this.applyExtendedColor(codes, index, false);
      }
    }
  }

  private applyExtendedColor(codes: number[], index: number, foreground: boolean): number {
    let cursor = index + 1;
    const colorType = codes[cursor];
    if (colorType === undefined) {
      return cursor;
    }

    const applyColor = (color: Color): void => {
      this.style = foreground
        ? this.style.add(Style.fromColor(color))
        : this.style.add(Style.fromColor(undefined, color));
    };

    if (colorType === 5) {
      cursor += 1;
      const colorNumber = codes[cursor];
      if (colorNumber !== undefined) {
        applyColor(Color.fromAnsi(colorNumber));
      }
      return cursor;
    }

    if (colorType === 2) {
      const red = codes[cursor + 1];
      const green = codes[cursor + 2];
      const blue = codes[cursor + 3];
      if (red !== undefined && green !== undefined && blue !== undefined) {
        applyColor(Color.fromRgb(red, green, blue));
      }
      return cursor + 3;
    }

    return cursor;
  }
}

export default AnsiDecoder;
