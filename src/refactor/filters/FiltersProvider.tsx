import React, { createContext, useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FiltersProviderProps {
  children: React.ReactNode;
}

type FiltersContextValue = {
  expandedFilter: string | null;
  setExpandedFilter: (label: string | null) => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export const FiltersProvider = (props: FiltersProviderProps) => {
  const { children } = props;

  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const context = {
    expandedFilter,
    setExpandedFilter
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