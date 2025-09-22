import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { OptionType } from '@/shared/types/types';

type SelectedOptions<T extends string> = Record<T, OptionType[]>;
type SetSelectedOptions<T extends string> = (
  next: Partial<SelectedOptions<T>>
) => void;
type ObjecEntries = [string, OptionType[] | undefined][];

// используется для множественной фильтрации
export const useFiltersSync = <const T extends string>(
  selectedOptions: SelectedOptions<T>,
  setSelectedOptions: SetSelectedOptions<T>,
  filtersKey: string,
  selectedKeysArr: T[]
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);

  // синхронизация фильтров из юрла с фильтрами на клиенте
  useEffect(() => {
    if (hasInitialized.current) return;
    const nextState: Partial<SelectedOptions<T>> = {};

    selectedKeysArr?.forEach((key: T) => {
      const values = searchParams?.getAll(`${filtersKey}:${key}`);
      if (values.length > 0) {
        nextState[key] = values?.map((v) => ({ label: v, id: v }));
      }
    });

    if (Object.keys(nextState).length > 0) {
      setSelectedOptions(nextState);
    }

    hasInitialized.current = true;
  }, [filtersKey]);

  // синхронизация выбранных фильтров с юрлом
  useEffect(() => {
    if (!hasInitialized.current) return;

    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);

        Array.from(nextParams.keys())
          .filter((key) => key.startsWith(`${filtersKey}:`))
          .forEach((key) => nextParams.delete(key));

        (Object.entries(selectedOptions) as ObjecEntries)?.reduce(
          (params, [key, arr]) => {
            const namespacedKey = `${filtersKey}:${key}`;
            arr?.forEach((opt) => params.append(namespacedKey, opt?.id));
            return params;
          },
          nextParams
        );

        return nextParams;
      },
      { replace: true }
    );
  }, [filtersKey, selectedOptions]);
};

//используется для одиночной фильтрации
export const useFilterSyncSingle = (
  filterId: string,
  filterValue: any,
  setFilter: (value: any) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // синхронизация из юрл в фильтры
  useEffect(() => {
    const currentFilter = searchParams.get(filterId);
    if (currentFilter !== null && currentFilter !== filterValue) {
      setFilter(currentFilter);
    }
  }, [filterId]);

  // синхронизация фильтров в юрл
  useEffect(() => {
    const currentUrlValue = searchParams.get(filterId);

    if (filterValue !== currentUrlValue) {
      setSearchParams(
        (params) => {
          if (filterValue && filterValue !== '') {
            params.set(filterId, String(filterValue));
          } else {
            params.delete(filterId);
          }
          return params;
        },
        { replace: true }
      );
    }
  }, [filterId, filterValue, searchParams, setSearchParams]);
};
