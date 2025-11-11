/**
 * Ratio distribution utilities for layout calculations.
 */

/**
 * Distribute an integer total into parts based on ratios.
 *
 * @param total - The total to divide.
 * @param ratios - A list of integer ratios.
 * @param minimums - List of minimum values for each slot.
 * @returns A list of integers guaranteed to sum to total.
 */
export function ratioDistribute(total: number, ratios: number[], minimums?: number[]): number[] {
  let adjustedRatios = ratios;
  if (minimums) {
    adjustedRatios = ratios.map((ratio, i) => (minimums[i] ? ratio : 0));
  }

  const totalRatio = adjustedRatios.reduce((sum, r) => sum + r, 0);
  if (totalRatio <= 0) {
    throw new Error('Sum of ratios must be > 0');
  }

  let totalRemaining = total;
  const distributedTotal: number[] = [];
  const mins = minimums ?? (Array(ratios.length).fill(0) as number[]);

  let currentTotalRatio = totalRatio;
  for (let i = 0; i < adjustedRatios.length; i++) {
    const ratio = adjustedRatios[i]!;
    const minimum = mins[i]!;

    if (currentTotalRatio > 0) {
      const distributed = Math.max(
        minimum,
        Math.ceil((ratio * totalRemaining) / currentTotalRatio)
      );
      distributedTotal.push(distributed);
      currentTotalRatio -= ratio;
      totalRemaining -= distributed;
    } else {
      distributedTotal.push(totalRemaining);
    }
  }

  return distributedTotal;
}

/**
 * Divide an integer total into parts based on ratios, reducing from values.
 *
 * @param total - The total to divide.
 * @param ratios - A list of integer ratios.
 * @param maximums - List of maximum values for each slot.
 * @param values - List of values.
 * @returns A list of integers guaranteed to sum to total.
 */
export function ratioReduce(
  total: number,
  ratios: number[],
  maximums: number[],
  values: number[]
): number[] {
  const adjustedRatios = ratios.map((ratio, i) => (maximums[i] ? ratio : 0));
  const totalRatio = adjustedRatios.reduce((sum, r) => sum + r, 0);

  if (totalRatio === 0) {
    return [...values];
  }

  let totalRemaining = total;
  const result: number[] = [];
  let currentTotalRatio = totalRatio;

  for (let i = 0; i < ratios.length; i++) {
    const ratio = adjustedRatios[i]!;
    const maximum = maximums[i]!;
    const value = values[i]!;

    if (ratio && currentTotalRatio > 0) {
      const distributed = Math.min(
        maximum,
        Math.round((ratio * totalRemaining) / currentTotalRatio)
      );
      result.push(value - distributed);
      totalRemaining -= distributed;
      currentTotalRatio -= ratio;
    } else {
      result.push(value);
    }
  }

  return result;
}

export interface RatioEdge {
  size?: number | null;
  ratio?: number | null;
  minimumSize?: number | null;
}

/**
 * Resolve explicit sizes / ratios / minimum sizes for layout edges.
 */
export function ratioResolve(total: number, edges: RatioEdge[]): number[] {
  const normalizeSize = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.max(0, Math.floor(value));
  };

  const ensureMinimum = (edge: RatioEdge): number => Math.max(1, edge.minimumSize ?? 1);
  const getRatio = (edge: RatioEdge): number => Math.max(0, edge.ratio ?? 1);

  const sizes: Array<number | null> = edges.map((edge) => normalizeSize(edge.size));

  const hasFlexible = (): boolean => sizes.some((size) => size === null);

  while (hasFlexible()) {
    const flexible = edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ index }) => sizes[index] === null);
    const remaining = total - sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);
    if (remaining <= 0) {
      return edges.map((edge, index) => sizes[index] ?? ensureMinimum(edge));
    }
    const totalRatio = flexible.reduce((sum, { edge }) => sum + getRatio(edge), 0);
    if (totalRatio <= 0) {
      return edges.map((edge, index) => sizes[index] ?? ensureMinimum(edge));
    }
    const portion = remaining / totalRatio;
    let assignedMinimum = false;
    for (const { edge, index } of flexible) {
      const desired = portion * getRatio(edge);
      if (desired <= ensureMinimum(edge)) {
        sizes[index] = ensureMinimum(edge);
        assignedMinimum = true;
      }
    }
    if (assignedMinimum) {
      continue;
    }
    let remainder = 0;
    for (const { edge, index } of flexible) {
      const exact = portion * getRatio(edge) + remainder;
      const size = Math.max(ensureMinimum(edge), Math.floor(exact));
      remainder = exact - size;
      sizes[index] = size;
    }
  }

  return sizes.map((size, index) => size ?? ensureMinimum(edges[index]!));
}
