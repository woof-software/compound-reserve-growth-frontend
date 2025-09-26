import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { OptionType } from '@/shared/types/types';

type SelectedOptions<T extends string> = Record<T, OptionType[]>;
type SetSelectedOptions<T extends string> = (
  next: Partial<SelectedOptions<T>>
) => void;
type ObjecEntries = [string, OptionType[] | undefined][];

/**
  This hook writes and reads URL parameters and implements two-way synchronization of filters. It is used for multiple filtering.
  1) Sets parameters from URLs to filters using a setter and an array of filter keys
  2) Sets filter values in URLs based on filters selected on the client
*/
export const useFiltersSync = <const T extends string>(
  selectedOptions: SelectedOptions<T>,
  setSelectedOptions: SetSelectedOptions<T>,
  filtersKey: string,
  selectedKeysArr: T[]
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  const initialHash = useRef(window.location.hash);

  // filters synchronization from URL to client state
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

    // Restore initial hash if it existed when page loaded
    if (initialHash.current) {
      window.location.hash = initialHash.current;
    }
  }, [filtersKey]);

  // filters synchronization from client state to url
  useEffect(() => {
    if (!hasInitialized.current) return;

    // Preserve the current hash/anchor (prioritize current hash over initial)
    const currentHash = window.location.hash || initialHash.current;

    setSearchParams(
      (params) => {
        Array.from(params.keys())
          .filter((key) => key.startsWith(`${filtersKey}:`))
          .forEach((key) => params.delete(key));
        (Object.entries(selectedOptions) as ObjecEntries)?.reduce(
          (params, [key, arr]) => {
            const namespacedKey = `${filtersKey}:${key}`;
            arr?.forEach((opt) => params.append(namespacedKey, opt?.id));
            return params;
          },
          params
        );

        return params;
      },
      { replace: true }
    );

    // Restore the hash after URL update if it existed
    if (currentHash) {
      window.location.hash = '';
    }
  }, [filtersKey, selectedOptions]);
};

/**This hook does the same thing as useFiltersSync, but is used for single filtering.*/
export const useFilterSyncSingle = (
  filterId: string,
  filterValue: any,
  setFilter: (value: any) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  const initialHash = useRef(window.location.hash);

  // filters synchronization from URL to client state
  useEffect(() => {
    const currentFilter = searchParams.get(filterId);
    if (currentFilter !== null && currentFilter !== filterValue) {
      setFilter(currentFilter);
    }

    hasInitialized.current = true;

    // Restore initial hash if it existed when page loaded
    if (initialHash.current) {
      window.location.hash = initialHash.current;
    }
  }, [filterId]);

  // filters synchronization from client state to url
  useEffect(() => {
    if (!hasInitialized.current) return;
    const currentUrlValue = searchParams.get(filterId);

    if (filterValue !== currentUrlValue) {
      // Preserve the current hash/anchor (prioritize current hash over initial)
      const currentHash = window.location.hash || initialHash.current;

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

      // Restore the hash after URL update if it existed
      if (currentHash) {
        window.location.hash = '';
      }
    }
  }, [filterId, filterValue, searchParams, setSearchParams]);
};
