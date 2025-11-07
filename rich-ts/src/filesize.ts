export interface FilesizeFormatOptions {
  precision?: number | null;
  separator?: string | null;
}

const DECIMAL_SUFFIXES = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;

const formatterCache = new Map<number, Intl.NumberFormat>();

function formatNumber(value: number, fractionDigits: number): string {
  const normalizedDigits = Math.max(0, fractionDigits);
  const formatter = getFormatter(normalizedDigits);
  const rounded = Number.parseFloat(value.toFixed(normalizedDigits));
  return formatter.format(rounded);
}

function getFormatter(fractionDigits: number): Intl.NumberFormat {
  let formatter = formatterCache.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      useGrouping: true,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatterCache.set(fractionDigits, formatter);
  }
  return formatter;
}

function formatInteger(value: number): string {
  return formatNumber(Math.trunc(value), 0);
}

function toStr(
  size: number,
  suffixes: readonly string[],
  base: number,
  options: FilesizeFormatOptions = {}
): string {
  if (!Number.isFinite(size) || size < 0) {
    throw new RangeError('size must be a non-negative finite number');
  }
  const precision = options.precision ?? 1;
  const separator = options.separator ?? ' ';

  if (size === 1) {
    return '1 byte';
  }
  if (size < base) {
    return `${formatInteger(size)} bytes`;
  }

  const suffixIndex = pickSuffixIndex(size, suffixes.length, base);
  const divisor = base ** (suffixIndex + 1);
  const value = size / divisor;
  const formatted = formatNumber(value, precision);
  const suffix = suffixes[Math.min(suffixIndex, suffixes.length - 1)] ?? '';
  return `${formatted}${separator}${suffix}`;
}

function pickSuffixIndex(size: number, suffixCount: number, base: number): number {
  let index = 0;
  while (index < suffixCount - 1) {
    const threshold = base ** (index + 2);
    if (size < threshold) {
      break;
    }
    index += 1;
  }
  return index;
}

/**
 * Convert a file size in to a human-readable string using decimal prefixes (powers of 1000).
 */
export function decimal(size: number, options?: FilesizeFormatOptions): string {
  return toStr(size, DECIMAL_SUFFIXES, 1000, options);
}

/**
 * Pick the best unit and suffix for a given size using the provided base.
 */
export function pickUnitAndSuffix(
  size: number,
  suffixes: readonly string[],
  base: number
): [number, string] {
  if (suffixes.length === 0) {
    throw new Error('suffixes must contain at least one entry');
  }
  let unit = 1;
  let suffix = suffixes[0]!;
  for (let i = 0; i < suffixes.length; i++) {
    suffix = suffixes[i]!;
    const nextUnit = unit * base;
    if (size < nextUnit || i === suffixes.length - 1) {
      break;
    }
    unit = nextUnit;
  }
  return [unit, suffix];
}
