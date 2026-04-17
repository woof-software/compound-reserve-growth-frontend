import { useMemo } from 'react';

import { useUrlFilterSync } from '@/refactor/hooks/useUrlFilterSync';
import { dataValuesToOptions } from '@/refactor/shared/utils';

interface FilterLevel<T> {
  key: string;
  getValue: (item: T) => string;
}

interface UseDependentFilterOptionsConfig<T> {
  rawData: T[];
  levels: FilterLevel<T>[];
}

/**
 * Derives filter options where each level depends on the selections of previous levels.
 * Reads selected values directly from URL params to avoid initialization order issues.
 *
 * @param rawData - Full dataset to derive options from
 * @param levels - Ordered filter levels, each narrowing data for the next.
 *                 Order matters: first level filters second, second filters third, etc.
 *
 * @returns Array of `Option[]` in the same order as `levels`
 *
 * @example
 * const [chainOptions, marketOptions] = useDependentFilterOptions({
 *   rawData,
 *   levels: [
 *     { key: 'chain', getValue: d => d.source.network },
 *     { key: 'market', getValue: d => d.source.market },
 *   ]
 * });
 */

export const useGetFilterOptions = <T,>({
   rawData,
   levels,
 }: UseDependentFilterOptionsConfig<T>) => {
  const urlValues = levels.map(({ key }) => {
    const { selectedValues } = useUrlFilterSync(key);
    return selectedValues;
  });

  return useMemo(() => {
    let narrowed = rawData;

    return levels.map((level, index) => {
      const levelOptions = dataValuesToOptions(narrowed.map(level.getValue));

      if (urlValues[index].length) {
        narrowed = narrowed.filter(item =>
          urlValues[index].includes(level.getValue(item))
        );
      }

      return levelOptions;
    });
  }, [levels, rawData, urlValues]);
};