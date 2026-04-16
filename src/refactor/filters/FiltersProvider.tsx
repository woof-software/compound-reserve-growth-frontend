import React, { createContext, useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FiltersProviderProps {
  children: React.ReactNode;
  filterKeys: string[];
}

type FiltersContextValue = {
  clearAll: () => void;
  hasSelectedFilters: boolean;
  isMobileFilterExpanded: boolean;
  setIsMobileFilterExpanded: (value: boolean) => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export const FiltersProvider = (props: FiltersProviderProps) => {
  const { children, filterKeys } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterExpanded, setIsMobileFilterExpanded] = useState(false);

  const clearAll = () => {
    const next = new URLSearchParams(searchParams);

    filterKeys.forEach((key) => {
      next.delete(key);
    });

    setSearchParams(next);
  };

  const hasSelectedFilters = filterKeys.some((key) => {
    return searchParams.getAll(key).length > 0;
  });

  const context = {
    clearAll,
    hasSelectedFilters,
    isMobileFilterExpanded,
    setIsMobileFilterExpanded
  };

  return (
    <FiltersContext.Provider value={context}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFiltersContext = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFiltersContext must be used inside FiltersProvider');
  return ctx;
};