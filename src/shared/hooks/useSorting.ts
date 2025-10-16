import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortAdapter<T> = {
  key: keyof T | null;
  type: SortDirection;
};
export type SortAccessor<T> = {
  accessorKey: keyof T;
  header: string;
};

function toComparable(value: unknown): number | string | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.getTime();
  }

  if (typeof value === 'number' && !isNaN(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();

    const ts = Date.parse(trimmed);

    if (!Number.isNaN(ts)) return ts;

    const asNum = Number(trimmed.replace(/,/g, ''));
    if (!Number.isNaN(asNum) && trimmed !== '') return asNum;

    return trimmed.toLowerCase();
  }

  return String(value);
}

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

    const decorated = data.map((item, idx) => {
      const raw = item[key as keyof T] as unknown;

      const comp = toComparable(raw);

      return { item, idx, comp };
    });

    decorated.sort((a, b) => {
      const av = a.comp;
      const bv = b.comp;

      if (av === null && bv !== null) return direction === 'asc' ? 1 : -1;

      if (av !== null && bv === null) return direction === 'asc' ? -1 : 1;

      if (av === null && bv === null) {
        return a.idx - b.idx;
      }

      if (typeof av === 'number' && typeof bv === 'number') {
        const cmp = av - bv;

        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
      } else if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv);

        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
      } else {
        const cmp = String(av).localeCompare(String(bv));

        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
      }

      return a.idx - b.idx;
    });

    return decorated.map((d) => d.item);
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
