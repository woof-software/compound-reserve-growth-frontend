import { useReducer } from 'react';

interface SortState {
  key: string;
  type: string;
}

const INITIAL_SORT_STATE: SortState = {
  key: '',
  type: 'asc'
};

export const useSorting = () => {
  const [sortType, setSortType] = useReducer(
    (prev: SortState, next: Partial<SortState>) => ({
      ...prev,
      ...next
    }),
    INITIAL_SORT_STATE
  );

  const onKeySelect = (key: string) => {
    setSortType({ key });
  };

  const onTypeSelect = (type: string) => {
    setSortType({ type });
  };

  const onClearSort = () => {
    setSortType(INITIAL_SORT_STATE);
  };

  const applySorting = (data: any[]) => {
    if (!sortType.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortType.key as keyof typeof a];
      const bValue = b[sortType.key as keyof typeof b];

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortType.type === 'asc' ? comparison : -comparison;
    });
  };

  return {
    sortType,
    onKeySelect,
    onTypeSelect,
    onClearSort,
    applySorting
  };
};
