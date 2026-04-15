import { useSearchParams } from 'react-router-dom';

type Serializer<T> = {
  parse: (v: string) => T;
  stringify: (v: T) => string;
};

// function useUrlSync<T>(key: string, value: T, serializer: Serializer<T> = JSON)

export const useUrlFilterSync = <T>(
  key: string,
  mode: 'single' | 'multi' = 'multi',
  serializer: Serializer<T> = JSON
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedValues = searchParams.getAll(key);

  const setSelectedValues = (value: string) => {
    const next_params = new URLSearchParams(searchParams);
    next_params.delete(key);

    if (mode === 'single') {
      const isSame = selectedValues[0] === value;
      if (!isSame) {
        next_params.append(key, value);
      }
    } else {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      next.forEach((v) => next_params.append(key, v));
    }

    setSearchParams(next_params);
  };

  const setAllValues = (values: string[]) => {
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

  return { selectedValues, setSelectedValues, setAllValues, clearAllValues };
};