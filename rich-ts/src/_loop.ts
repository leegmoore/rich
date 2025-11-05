/**
 * Utility functions for iterating with first/last flags.
 */

/**
 * Iterate and generate a tuple with a flag for first value.
 *
 * @param values - Iterable to process
 * @yields Tuple of [isFirst, value]
 */
export function* loopFirst<T>(values: Iterable<T>): Generator<[boolean, T]> {
  const iterator = values[Symbol.iterator]();
  const first = iterator.next();

  if (first.done) {
    return;
  }

  yield [true, first.value];

  let current = iterator.next();
  while (!current.done) {
    yield [false, current.value];
    current = iterator.next();
  }
}

/**
 * Iterate and generate a tuple with a flag for last value.
 *
 * @param values - Iterable to process
 * @yields Tuple of [isLast, value]
 */
export function* loopLast<T>(values: Iterable<T>): Generator<[boolean, T]> {
  const iterator = values[Symbol.iterator]();
  let previous = iterator.next();

  if (previous.done) {
    return;
  }

  let current = iterator.next();
  while (!current.done) {
    yield [false, previous.value];
    previous = current;
    current = iterator.next();
  }

  yield [true, previous.value];
}

/**
 * Iterate and generate a tuple with flags for first and last value.
 *
 * @param values - Iterable to process
 * @yields Tuple of [isFirst, isLast, value]
 */
export function* loopFirstLast<T>(values: Iterable<T>): Generator<[boolean, boolean, T]> {
  const iterator = values[Symbol.iterator]();
  let previous = iterator.next();

  if (previous.done) {
    return;
  }

  let isFirst = true;
  let current = iterator.next();

  while (!current.done) {
    yield [isFirst, false, previous.value];
    isFirst = false;
    previous = current;
    current = iterator.next();
  }

  yield [isFirst, true, previous.value];
}
