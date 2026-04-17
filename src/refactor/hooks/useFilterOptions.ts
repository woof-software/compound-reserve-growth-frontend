import { useSearchParams } from 'react-router-dom';

import { useUrlFilterSync } from '@/refactor/hooks/useUrlFilterSync';

export type Option = { label: string; value: string };

/**
 * Manages a single filter's selected options synced with URL search params.
 * Turns selected urls params into `Option[]`.
 *
 * @param key - URL search param key (e.g. `'ttv-chain'`)
 * @param options - Available options to select from
 * @param mode - `'single'` allows one selection, `'multi'` allows many
 * @param defaultValue - Option value selected by default if URL param is absent
 *
 * @returns Tuple of:
 * - `selectedOptions` - Currently selected `Option[]` derived from URL
 * - `setSelectedOptions` - Toggles a single option in/out of selection
 * - `selectAll` - Selects all available options
 * - `clearAllValues` - Clears all selections from URL
 *
 * @example
 * const [selectedChains, setSelectedChains, selectAll, clearAll] = useFilterOptions(
 *   'ttv-chain',
 *   chainOptions,
 *   'multi'
 * );
 */
export const useFilterOptions = (
  key: string,
  options: Option[],
  mode: 'single' | 'multi' = 'multi',
  defaultValue?: string
) => {
  const {selectedValues, setSelectedValues} = useUrlFilterSync(key, mode, defaultValue);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedOptions = options.filter((option: Option) => {
    return selectedValues.includes(option.value);
  });

  const setSelectedOptions = (option: Option) => {
    return setSelectedValues(option.value);
  };

  const selectAll = () => {
    const values = options.map((option) => option.value);
    const next_params = new URLSearchParams(searchParams);
    next_params.delete(key);
    values.forEach((v) => next_params.append(key, v));
    setSearchParams(next_params);
  };

  const clearAllValues = () => {
    const next_params = new URLSearchParams(searchParams);
    next_params.delete(key);
    setSearchParams(next_params);
  };

  return [
    selectedOptions,
    setSelectedOptions,
    selectAll,
    clearAllValues
  ] as const;
};