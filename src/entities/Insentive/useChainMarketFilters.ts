import { useCallback, useMemo, useReducer } from 'react';

import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { OptionType } from '@/shared/types/types';

type FilterState = {
  chain: OptionType[];
  deployment: OptionType[];
};

type FilterAction =
  | { type: 'SET_CHAIN'; payload: OptionType[] }
  | { type: 'SET_DEPLOYMENT'; payload: OptionType[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_ALL' };

const filterReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case 'SET_CHAIN':
      return { ...state, chain: action.payload };
    case 'SET_DEPLOYMENT':
      return { ...state, deployment: action.payload };
    case 'SET_FILTERS':
      return { ...state, ...action.payload };
    case 'CLEAR_ALL':
      return { chain: [], deployment: [] };
    default:
      return state;
  }
};

type UseChainMarketFiltersOptions = {
  filterByLatestDate?: boolean;
};

export const useChainMarketFilters = (
  data: CombinedIncentivesData[],
  { filterByLatestDate = true }: UseChainMarketFiltersOptions = {}
) => {
  const [selectedOptions, dispatch] = useReducer(filterReducer, {
    chain: [],
    deployment: []
  });

  // Get unique chain options from data
  const chainOptions = useMemo(() => {
    const uniqueNetworks = [
      ...new Set(data.map((item) => item.source.network))
    ];
    return uniqueNetworks.map((network) => ({
      id: network,
      label: capitalizeFirstLetter(network)
    }));
  }, [data]);

  const allMarketOptions: {
    id: string;
    label: string;
    chain?: string[];
  }[] = useMemo(() => {
    if (!data) return [];

    const uniqueMarketMap = new Map<string, { network?: string }>();

    for (const item of data) {
      const market = item.source?.market;
      const network = item.source?.network;

      if (market && !uniqueMarketMap.has(market)) {
        uniqueMarketMap.set(market, { network });
      }
    }

    return Array.from(uniqueMarketMap.entries()).map(([market, details]) => ({
      id: market,
      label: market,
      ...(details.network && { chain: [details.network] })
    }));
  }, [data]);

  // Filter markets based on selected chains
  const deploymentOptionsFilter = useMemo(() => {
    if (selectedOptions.chain.length === 0) {
      return allMarketOptions;
    }

    const selectedNetworks = selectedOptions.chain.map((chain) => chain.id);

    return allMarketOptions.filter((market) =>
      market.chain?.some((network) => selectedNetworks.includes(network))
    );
  }, [allMarketOptions, selectedOptions.chain]);

  // Handle chain selection
  const onSelectChain = useCallback(
    (newChainSelection: OptionType[]) => {
      // If no chains selected, keep all markets
      if (newChainSelection.length === 0) {
        dispatch({ type: 'SET_CHAIN', payload: [] });
        return;
      }

      const selectedNetworks = newChainSelection.map((chain) => chain.id);

      // Filter out markets that don't belong to selected chains
      const validMarkets = selectedOptions.deployment.filter((market) => {
        const marketOption = allMarketOptions.find(
          (opt) => opt.id === market.id
        );
        return marketOption?.chain?.some((network) =>
          selectedNetworks.includes(network)
        );
      });

      dispatch({
        type: 'SET_FILTERS',
        payload: {
          chain: newChainSelection,
          deployment: validMarkets
        }
      });
    },
    [allMarketOptions, selectedOptions.deployment]
  );

  // Handle market selection
  const onSelectMarket = useCallback((newMarketSelection: OptionType[]) => {
    dispatch({ type: 'SET_DEPLOYMENT', payload: newMarketSelection });
  }, []);

  // Get filtered data based on selections
  const filteredData = useMemo(() => {
    let result = data;

    if (filterByLatestDate && result.length > 0) {
      const latestDate = Math.max(...result.map((item) => item.date));
      result = result.filter((item) => item.date === latestDate);
    }

    // Then filter by chains
    if (selectedOptions.chain?.length > 0) {
      const selectedNetworks = selectedOptions.chain.map((chain) => chain.id);
      result = result.filter((item) =>
        selectedNetworks.includes(item.source.network)
      );
    }

    // Then filter by markets
    if (selectedOptions.deployment?.length > 0) {
      const selectedMarkets = selectedOptions.deployment.map(
        (market) => market.id
      );
      result = result.filter((item) =>
        selectedMarkets.includes(item.source.market!)
      );
    }

    return result;
  }, [data, selectedOptions]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const setSelectedOptions = (partialState: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: partialState });
  };

  // used for mobile filters
  const mobileFilterOptions = () => [
    {
      id: 'chain',
      placeholder: 'Chain',
      total: selectedOptions.chain.length,
      selectedOptions: selectedOptions.chain,
      options: chainOptions || [],
      onChange: onSelectChain
    },
    {
      id: 'market',
      placeholder: 'Market',
      total: selectedOptions.deployment.length,
      selectedOptions: selectedOptions.deployment,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    }
  ];

  return {
    chainOptions,
    deploymentOptionsFilter,
    selectedOptions,
    setSelectedOptions,
    onSelectChain,
    onSelectMarket,
    filteredData,
    clearAllFilters,
    mobileFilterOptions
  };
};
