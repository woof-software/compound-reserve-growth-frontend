import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { OptionType } from '@/shared/types/types';

type selectedOptions = Record<string, OptionType[]>;
type setSelectedOptions = (next: Partial<Record<string, OptionType[]>>) => void;
type selectedKeysArr = string[];

export const useFiltersSync = (
  selectedOptions: selectedOptions,
  setSelectedOptions: setSelectedOptions,
  selectedKeysArr: selectedKeysArr = [
    'chain',
    'assetType',
    'deployment',
    'symbol'
  ]
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const nextState: Partial<Record<string, OptionType[]>> = {};

    selectedKeysArr.forEach((key) => {
      const values = searchParams.getAll(key);
      if (values.length > 0) {
        nextState[key] = values.map((v) => ({ label: v, id: v }));
      }
    });

    if (Object.keys(nextState).length > 0) {
      setSelectedOptions(nextState);
    }
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    // double cycle optimisation needed?
    // think about braces
    Object.entries(selectedOptions).forEach(([key, arr]) => {
      arr.forEach((opt) => {
        nextParams.append(key, opt?.id);
      });
    });

    setSearchParams(nextParams, { replace: true });
  }, [selectedOptions, setSearchParams]);
};
