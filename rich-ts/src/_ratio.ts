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
  const mins = minimums ?? Array(ratios.length).fill(0);

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
