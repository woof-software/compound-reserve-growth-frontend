import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { OptionType } from '@/shared/types/types';

type selectedOptions = Record<string, OptionType[]>;
type setSelectedOptions = (next: Partial<Record<string, OptionType[]>>) => void;
type selectedKeysArr = string[];

export const useFiltersSync = (
  selectedOptions: selectedOptions,
  setSelectedOptions: setSelectedOptions,
  filtersKey: string,
  selectedKeysArr: selectedKeysArr = [
    'chain',
    'assetType',
    'deployment',
    'symbol'
  ]
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    const nextState: Partial<Record<string, OptionType[]>> = {};

    selectedKeysArr.forEach((key) => {
      const values = searchParams.getAll(`${filtersKey}:${key}`);
      if (values.length > 0) {
        nextState[key] = values.map((v) => ({ label: v, id: v }));
      }
    });

    if (Object.keys(nextState).length > 0) {
      setSelectedOptions(nextState);
    }

    hasInitialized.current = true;
  }, [searchParams, filtersKey, selectedKeysArr, setSelectedOptions]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);

        Array.from(nextParams.keys())
          .filter((key) => key.startsWith(`${filtersKey}:`))
          .forEach((key) => nextParams.delete(key));

        Object.entries(selectedOptions).reduce((params, [key, arr]) => {
          const namespacedKey = `${filtersKey}:${key}`;
          arr.forEach((opt) => params.append(namespacedKey, opt?.id));
          return params;
        }, nextParams);

        return nextParams;
      },
      { replace: true }
    );
  }, [filtersKey, selectedOptions, setSearchParams]);
};
