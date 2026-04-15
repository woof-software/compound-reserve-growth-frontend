import { useUrlFilterSync } from '@/refactor/hooks/useUrlFilterSync';

export type Option = { label: string; value: string };

export const useFilterOptions = (
  key: string,
  options: Option[],
  mode: 'single' | 'multi' = 'multi'
) => {
  const { selectedValues, setSelectedValues, setAllValues, clearAllValues } = useUrlFilterSync(key, mode);

  const selectedOptions = options.filter((option: Option) => selectedValues.includes(option.value));
  const setSelectedOptions = (option: Option) => setSelectedValues(option.value);
  const selectAll = () => setAllValues(options.map((option) => option.value));

  return [selectedOptions, setSelectedOptions, selectAll, clearAllValues] as const;
};