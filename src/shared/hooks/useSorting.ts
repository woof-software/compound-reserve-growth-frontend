import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortAdapter<T> = {
  key: keyof T | null;
  type: 'asc' | 'desc';
};
export type SortAccessor<T> = {
  accessorKey: keyof T;
  header: string;
};

/**
 * A custom hook used to handle sorting functionality for collections of data in a React component.
 *
 * @template T The type of the elements in the collection to be sorted.
 *
 * @param initialDirection The initial sorting direction, either 'asc' for ascending or 'desc' for descending.
 * @param initialKey The initial key by which the data should be sorted, or null if no sorting key is specified.
 *
 * @returns An object containing the following methods and properties for sorting:
 * - `{ sortType }`: Contains current sorting state including key and direction.
 * - `{ onKeySelect }`: Function to update the sorting key dynamically.
 * - `{ onTypeSelect }`: Function to update the sorting direction dynamically.
 * - `{ onClearSort }`: Function to reset the sorting to its initial state.
 * - `{ applySorting }`: Function to apply the current sorting settings to a given collection of data.
 */
export const useSorting = <T>(
  initialDirection: SortDirection,
  initialKey: keyof T | null
) => {
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [key, setKey] = useState<keyof T | null>(initialKey);

  const onKeySelect = (key: keyof T | null) => {
    setKey(key);
  };

  const onTypeSelect = (type: SortDirection) => {
    setDirection(type);
  };

  const onClearSort = () => {
    setKey(initialKey);
    setDirection(initialDirection);
  };

  const applySorting = (data: T[]): T[] => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  return {
    sortDirection: direction,
    sortKey: key,
    onKeySelect,
    onTypeSelect,
    onClearSort,
    applySorting
  };
};
