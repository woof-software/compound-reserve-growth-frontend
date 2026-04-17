import { Option } from '@/refactor/hooks/useFilterOptions';

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str?.slice(1);
};

export const dataValuesToOptions = (values: string[]) =>
  [...new Set(values)]
    .filter(Boolean)
    .sort()
    .map(value => ({ label: capitalize(value), value: value }));

export const matchesFilter = <T,>(selected: Option[], getValue: (v: T) => string) => {
  return (v: T) => {
    return !selected.length || selected.some(o => o.value === getValue(v));
  };
};
  