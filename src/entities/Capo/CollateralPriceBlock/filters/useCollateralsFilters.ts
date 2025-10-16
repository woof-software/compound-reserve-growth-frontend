import { useCallback, useMemo, useReducer } from 'react';

import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CapoTableItem } from '@/shared/types/Capo/types';
import { OptionType } from '@/shared/types/types';

type FilterState = {
  chain: OptionType[];
  collateral: OptionType[];
};

type FilterAction =
  | { type: 'SET_CHAIN'; payload: OptionType[] }
  | { type: 'SET_COLLATERAL'; payload: OptionType[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_ALL' };

const filterReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case 'SET_CHAIN':
      return { ...state, chain: action.payload };
    case 'SET_COLLATERAL':
      return { ...state, collateral: action.payload };
    case 'SET_FILTERS':
      return { ...state, ...action.payload };
    case 'CLEAR_ALL':
      return { chain: [], collateral: [] };
    default:
      return state;
  }
};

export const useCollateralsFilters = (tableData: CapoTableItem[]) => {
  const [selectedOptions, dispatch] = useReducer(filterReducer, {
    chain: [],
    collateral: []
  });

  const chainOptions = useMemo(() => {
    const uniqueNetworks = [...new Set(tableData.map((item) => item.network))];
    return uniqueNetworks
      .filter(Boolean)
      .map((network) => ({
        id: network,
        label: capitalizeFirstLetter(network)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tableData]);

  const allCollateralOptions: {
    id: string;
    label: string;
    chain: string[];
  }[] = useMemo(() => {
    if (!tableData?.length) return [];

    const collateralToNetworks = new Map<string, Set<string>>();

    for (const item of tableData) {
      const collateral = item.collateral?.trim();
      const network = item.network?.trim();

      if (!collateral || !network) continue;

      if (!collateralToNetworks.has(collateral)) {
        collateralToNetworks.set(collateral, new Set());
      }

      collateralToNetworks.get(collateral)!.add(network);
    }

    return Array.from(collateralToNetworks.entries())
      .map(([collateral, networks]) => ({
        id: collateral,
        label: collateral,
        chain: Array.from(networks)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tableData]);

  const collateralOptions = useMemo(() => {
    if (selectedOptions.chain.length === 0) {
      return allCollateralOptions;
    }

    const selectedNetworks = selectedOptions.chain.map((chain) => chain.id);

    return allCollateralOptions.filter((collateral) =>
      collateral.chain?.some((network) => selectedNetworks.includes(network))
    );
  }, [allCollateralOptions, selectedOptions.chain]);

  const onSelectChain = useCallback(
    (newChainSelection: OptionType[]) => {
      if (newChainSelection.length === 0) {
        dispatch({ type: 'SET_CHAIN', payload: [] });
        return;
      }

      const selectedNetworks = newChainSelection.map((chain) => chain.id);

      const validCollaterals = selectedOptions.collateral.filter(
        (collateral) => {
          const collateralOption = allCollateralOptions.find(
            (opt) => opt.id === collateral.id
          );

          return collateralOption?.chain?.some((network) =>
            selectedNetworks.includes(network)
          );
        }
      );

      dispatch({
        type: 'SET_FILTERS',
        payload: {
          chain: newChainSelection,
          collateral: validCollaterals
        }
      });
    },
    [allCollateralOptions, selectedOptions.collateral]
  );

  const onSelectCollateral = useCallback(
    (newCollateralSelection: OptionType[]) => {
      dispatch({ type: 'SET_COLLATERAL', payload: newCollateralSelection });
    },
    []
  );

  const applyFilters = useCallback(
    (data: CapoTableItem[]) => {
      let result = data;

      if (selectedOptions.chain?.length > 0) {
        const selectedNetworks = selectedOptions.chain.map((chain) => chain.id);
        result = result.filter((item) =>
          selectedNetworks.includes(item.network)
        );
      }

      if (selectedOptions.collateral?.length > 0) {
        const selectedCollaterals = selectedOptions.collateral.map(
          (collateral) => collateral.id
        );
        result = result.filter((item) =>
          selectedCollaterals.includes(item.collateral)
        );
      }

      return result;
    },
    [selectedOptions]
  );

  const onClearSelectedOptions = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const setSelectedOptions = (partialState: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: partialState });
  };

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

  return {
    selectedOptions,
    setSelectedOptions,
    filterOptions,
    chainOptions,
    collateralOptions,
    onSelectChain,
    onSelectCollateral,
    onClearSelectedOptions,
    applyFilters
  };
};
