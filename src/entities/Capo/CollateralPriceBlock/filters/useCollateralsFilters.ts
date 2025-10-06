import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { useFiltersSync } from '@/shared/hooks/useFiltersSync';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { TableItem } from '@/shared/types/Capo/types';
import { OptionType } from '@/shared/types/types';

interface FilterState {
  chain: OptionType[];
  collateral: OptionType[];
}

const INITIAL_FILTER_STATE: FilterState = {
  chain: [],
  collateral: []
};

interface FilterOption {
  id: string;
  label: string;
}

const createFilterOptions = (
  data: TableItem[],
  field: keyof TableItem,
  transformLabel?: (value: string) => string
): FilterOption[] => {
  const uniqueValues = [...new Set(data.map((item) => item[field]))];

  return uniqueValues
    .filter(Boolean)
    .map((value) => ({
      id: value,
      label: transformLabel ? transformLabel(value) : value
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useCollateralsFilters = (tableData: TableItem[]) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev: FilterState, next: Partial<FilterState>) => ({
      ...prev,
      ...next
    }),
    INITIAL_FILTER_STATE
  );

  useFiltersSync(selectedOptions, setSelectedOptions, 'cpapr', [
    'chain',
    'collateral'
  ]);

  const chainOptions = useMemo(
    () => createFilterOptions(tableData, 'network', capitalizeFirstLetter),
    [tableData]
  );

  const collateralOptions = useMemo(() => {
    return createFilterOptions(
      tableData.filter(({ network }) => {
        if (!selectedOptions.chain.length) return true;

        const isNetworkSelected = selectedOptions.chain.some(
          ({ id }) => id === network
        );

        return isNetworkSelected;
      }),
      'collateral'
    );
  }, [tableData, selectedOptions.chain]);

  const onSelectChain = useCallback((selectedChains: OptionType[]) => {
    setSelectedOptions({
      chain: selectedChains
    });
  }, []);

  const onSelectCollateral = useCallback((collateral: OptionType[]) => {
    setSelectedOptions({ collateral });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions(INITIAL_FILTER_STATE);
  }, []);

  const filterOptions = useMemo(
    () => [
      {
        id: 'chain',
        placeholder: 'Chain',
        total: selectedOptions.chain.length,
        selectedOptions: selectedOptions.chain,
        options: chainOptions || [],
        onChange: onSelectChain
      },
      {
        id: 'collateral',
        placeholder: 'Collateral',
        total: selectedOptions.collateral.length,
        selectedOptions: selectedOptions.collateral,
        options: collateralOptions || [],
        onChange: onSelectCollateral
      }
    ],
    [
      chainOptions,
      collateralOptions,
      selectedOptions,
      onSelectChain,
      onSelectCollateral
    ]
  );

  const applyFilters = useCallback(
    (data: TableItem[]) => {
      return data.filter((item) => {
        if (
          selectedOptions.chain.length > 0 &&
          !selectedOptions.chain.some((option) => option.id === item.network)
        ) {
          return false;
        }

        if (
          selectedOptions.collateral.length > 0 &&
          !selectedOptions.collateral.some(
            (option) => option.id === item.collateral
          )
        ) {
          return false;
        }

        return true;
      });
    },
    [selectedOptions]
  );

  useEffect(() => {
    const filteredCollaterals = selectedOptions.collateral.filter(({ id }) => {
      return collateralOptions.some(({ id: _id }) => id === _id);
    });

    setSelectedOptions({
      collateral: filteredCollaterals
    });
  }, [collateralOptions]);

  return {
    selectedOptions,
    filterOptions,
    chainOptions,
    collateralOptions,
    onSelectChain,
    onSelectCollateral,
    onClearSelectedOptions,
    applyFilters
  };
};
