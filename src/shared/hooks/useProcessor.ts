import { useMemo } from 'react';

type Filter<T> = (item: T) => boolean;
type Transformer<T, R> = () => (item: T) => R;

export interface ProcessorConfig<T, R> {
  array: T[];
  filters: Filter<T>[];
  transformer: Transformer<T, R>;
}

/**
 * Pure function that filters an array and runs each item through a transformer.
 * The transformer is a factory — called once before iteration so it can safely
 * close over a local accumulator without state leaking between runs.
 *
 * array - Raw data to process
 * filters - Predicate functions — item is excluded if any returns `false`
 * transformer - Factory that returns a reducer function `(item: T) => R`
 * @returns Final accumulated result of type `R`
 */

const process = <T, R>(config: ProcessorConfig<T, R>): R => {
  const { array, filters, transformer } = config;

  const filtered = array.filter(item => filters.every(f => f(item)));
  const transform = transformer();

  let result: R = undefined as unknown as R;
  filtered.forEach(item => { result = transform(item); });

  return result;
};

/**
 * Hook around `process`. Re-runs automatically when `array`,
 * `filters`, or `transformer` change. Also exposes a manual `processData`
 * for imperative usage (e.g. on button click).
 *
 *
 * @returns
 * - `result` — latest processed value, recomputed on dependency change
 * - `processData` — manually trigger processing with a custom config
 *
 * @example
 * // Reactive — auto-runs when data or filters change
 * const { result } = useProcessor({
 *   array: rawData,
 *   filters: [
 *     (v) => v.value > 0,
 *     (v) => selectedChains.includes(v.source.network),
 *   ],
 *   transformer: () => {
 *     const acc: Record<string, number> = {};
 *     return (v) => {
 *       acc[v.source.network] = (acc[v.source.network] ?? 0) + v.value;
 *       return acc;
 *     };
 *   }
 * });
 *
 * @example
 * // Manual — trigger on user action
 * const { processData } = useProcessor({ array: [], filters: [], transformer: () => v => v });
 *
 * const onClick = () => {
 *   const result = processData({ array: rawData, filters: [...], transformer: ... });
 * };
 */

export const useProcessor = <T, R>(config: ProcessorConfig<T, R>) => {
  const result = useMemo(() => process(config), [config]);
  return { result };
};