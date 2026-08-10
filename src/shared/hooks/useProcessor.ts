import { useMemo } from 'react';

export type ProcessorFilter<T> = (value: T) => boolean;

export type ProcessorReducerObject<T, R> = {
  // Initial value just like within array.reduce
  accumulator: R,

  // Reduction predicate which returns updated accumulator value
  reduce: (accumulator: R, value: T) => R,
}

export type ProcessorReducer<T, R> = ProcessorReducerObject<T, R> | ((source: T[]) => ProcessorReducerObject<T, R>);

export interface ProcessorConfig<T, R> {
  // Raw data to process
  array: T[];
  
  // Predicate functions — item is excluded if any returns `false`
  filters: ProcessorFilter<T>[];
  
  // Factory that returns a reducer function `(item: T) => R`
  reducer: ProcessorReducer<T, R>;
}

/**
 * Pure function that filters an array and runs each item through a transformer.
 * The transformer is a factory — called once before iteration so it can safely
 * close over a local accumulator without state leaking between runs.
 * 
 * @returns Final accumulated result of type `R`
 */

export function processor<T, R>(config: ProcessorConfig<T, R>): R {
  const {
    array,
    filters,
    reducer,
  } = config;

  const {
    accumulator,
    reduce,
  } = typeof reducer === 'function' ? reducer(array) : reducer;
  
  let result: R = accumulator;
  
  for (const item of array) {
    const isValid = filters.every(f => f(item));

    if (!isValid) continue;

    result = reduce(result, item);
  }
  
  return result;
}

/**
 * Hook around `process`. Re-runs automatically when `array`,
 * `filters`, or `transformer` change. Also exposes a manual `processData`
 * for imperative usage (e.g. on button click).
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
 *   reducer: () => {
 *     return {
 *       accumulator: {} as Record<string, number>,
 *       reduce: (acc, v) => {
 *          return {
 *            ...acc,
 *            [v.source.network]: (acc[v.source.network] ?? 0) + v.value,
 *          };
 *       }
 *     }
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
  const result = useMemo(() => processor(config), [config]);
  return { result };
};