import { useSearchParams } from 'react-router-dom';

import { useUrlFilterSync } from '@/refactor/hooks/useUrlFilterSync';

export type Option = { label: string; value: string };

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