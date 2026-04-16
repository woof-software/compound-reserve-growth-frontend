import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


export const useUrlFilterSync = (
  key: string,
  mode: 'single' | 'multi' | 'range' = 'multi',
  defaultValue?: string,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedValues = searchParams.getAll(key);

  useEffect(() => {
    if (selectedValues.length === 0 && defaultValue) {
      const next = new URLSearchParams(searchParams);
      next.set(key, defaultValue);
      setSearchParams(next, { replace: true });
    }
  }, [key, defaultValue, searchParams, setSearchParams, selectedValues.length]);

  const setSelectedValues = (value: string | string[]) => {
    const next_params = new URLSearchParams(searchParams);
    next_params.delete(key);

    if (mode === 'range') {
      (value as string[]).forEach((v) => {
        if (v) next_params.append(key, v);
      });
    } else if (mode === 'single') {
      const isSame = selectedValues[0] === value;
      if (!isSame) next_params.append(key, value as string);
    } else {
      const next = selectedValues.includes(value as string)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value as string];
      next.forEach((v) => next_params.append(key, v));
    }

    setSearchParams(next_params);
  };

  return { selectedValues, setSelectedValues };
};