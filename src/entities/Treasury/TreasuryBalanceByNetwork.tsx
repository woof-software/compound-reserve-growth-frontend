import React, { useCallback, useMemo, useReducer } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import Filter from '@/components/Filter/Filter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryBalanceByNetwork, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryBalanceByNetwork';
import { useFiltersSync } from '@/shared/hooks/useFiltersSync';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import {
  capitalizeFirstLetter,
  colorPicker,
  extractFilterOptions,
  filterAndSortMarkets
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import View from '@/shared/ui/View/View';

interface TreasuryBalanceByNetworkBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

const mapTableData = (data: TokenData[]): TreasuryBalanceByNetworkType[] => {
  return data.map((el) => {
    const decimals = el.source.asset.decimals || 0;
    const rawQuantity = Number(el.quantity) || 0;
    const humanReadableQuantity = rawQuantity / 10 ** decimals;

    return {
      symbol: el.source.asset.symbol,
      chain: capitalizeFirstLetter(el.source.network),
      market: el.source.market ?? 'no market',
      qty: humanReadableQuantity,
      value: el.value,
      price: el.price,
      source: el.source.type,
      address: el.source.address
    };
  });
};

export const treasuryBalanceByNetworkColumns: SortAccessor<TreasuryBalanceByNetworkType>[] =
  [
    {
      accessorKey: 'symbol',
      header: 'Symbol'
    },
    {
      accessorKey: 'chain',
      header: 'Chain'
    },
    {
      accessorKey: 'market',
      header: 'Market'
    },
    {
      accessorKey: 'qty',
      header: 'QTY'
    },
    {
      accessorKey: 'value',
      header: 'Value'
    },
    {
      accessorKey: 'price',
      header: 'Price'
    },
    {
      accessorKey: 'source',
      header: 'Source'
    }
  ];

const TreasuryBalanceByNetworkBlock = ({
  isLoading,
  isError,
  data
}: TreasuryBalanceByNetworkBlockProps) => {
  const {
    isOpen: isFilterOpen,
    onOpenModal: onFilterOpen,
    onCloseModal: onFilterClose
  } = useModal();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [{ id: 'mainnet', label: 'Mainnet' }] as OptionType[],
      assetType: [] as OptionType[],
      deployment: [] as OptionType[],
      symbol: [] as OptionType[]
    }
  );

  useFiltersSync(selectedOptions, setSelectedOptions, 'tbbn', [
    'chain',
    'assetType',
    'deployment',
    'symbol'
  ]);

  const { sortKey, sortDirection, onKeySelect, onTypeSelect } =
    useSorting<TreasuryBalanceByNetworkType>('asc', null);

  const sortType: SortAdapter<TreasuryBalanceByNetworkType> = {
    type: sortDirection,
    key: sortKey
  };

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      assetType: { path: 'source.asset.type' },
      deployment: { path: 'source.market' },
      symbol: { path: 'source.asset.symbol' }
    }),
    []
  );

  const { chainOptions, assetTypeOptions, deploymentOptions, symbolOptions } =
    useMemo(
      () => extractFilterOptions(data, filterOptionsConfig),
      [data, filterOptionsConfig]
    );

  const deploymentOptionsFilter = useMemo(() => {
    return filterAndSortMarkets(
      deploymentOptions,
      selectedOptions.chain.map((o) => o.id)
    );
  }, [deploymentOptions, selectedOptions]);

  const tableData = useMemo<TreasuryBalanceByNetworkType[]>(() => {
    const filtered = data.filter((item) => {
      if (
        selectedOptions.chain.length > 0 &&
        !selectedOptions.chain.some(
          (o: OptionType) => o.id === item.source.network
        )
      ) {
        return false;
      }

      if (
        selectedOptions.assetType.length > 0 &&
        !selectedOptions.assetType.some(
          (o: OptionType) => o.id === item.source.asset.type
        )
      ) {
        return false;
      }

      const market = item.source.market ?? 'no market';

      if (
        selectedOptions.deployment.length > 0 &&
        !selectedOptions.deployment.some((o: OptionType) =>
          o.id === 'no name' ? market === 'no market' : o.id === market
        )
      ) {
        return false;
      }

      if (
        selectedOptions.symbol.length > 0 &&
        !selectedOptions.symbol.some(
          (o: OptionType) => o.id === item.source.asset.symbol
        )
      ) {
        return false;
      }

      return true;
    });

    return mapTableData(filtered).sort((a, b) => b.value - a.value);
  }, [data, selectedOptions]);

  const chartData = useMemo(() => {
    return tableData
      .map((item, index) => ({
        name: item.symbol,
        value: item.value,
        color: colorPicker(index)
      }))
      .filter((el) => el.value > 0);
  }, [tableData]);

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.deployment.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );
      setSelectedOptions({ chain, deployment: filteredDeployment });
    },
    [selectedOptions.deployment]
  );

  const onSelectAssetType = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      assetType: selectedOptions
    });
  }, []);

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onSelectSymbol = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      symbol: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    });
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

  const onClearFilters = useCallback(() => {
    setSelectedOptions({
      chain: [{ id: 'mainnet', label: 'Mainnet' }],
      assetType: [],
      deployment: [],
      symbol: []
    });
  }, []);

  const filterOptions = useMemo(() => {
    const chainFilterOptions = {
      id: 'chain',
      placeholder: 'Chain',
      total: selectedOptions.chain.length,
      selectedOptions: selectedOptions.chain,
      options: chainOptions || [],
      onChange: onSelectChain
    };

    const marketFilterOptions = {
      id: 'market',
      placeholder: 'Market',
      total: selectedOptions.deployment.length,
      selectedOptions: selectedOptions.deployment,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    const assetTypeFilterOptions = {
      id: 'assetType',
      placeholder: 'Asset Type',
      total: selectedOptions.assetType.length,
      selectedOptions: selectedOptions.assetType,
      options:
        assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectAssetType
    };

    const symbolFilterOptions = {
      id: 'reserveSymbol',
      placeholder: 'Reserve Symbols',
      total: selectedOptions.symbol.length,
      selectedOptions: selectedOptions.symbol,
      options:
        symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectSymbol
    };

    return [
      chainFilterOptions,
      marketFilterOptions,
      assetTypeFilterOptions,
      symbolFilterOptions
    ];
  }, [
    assetTypeOptions,
    chainOptions,
    deploymentOptionsFilter,
    onSelectAssetType,
    onSelectChain,
    onSelectMarket,
    onSelectSymbol,
    selectedOptions,
    symbolOptions
  ]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Treasury Balance by Network'
      id='treasury-balance-by-network'
      className={{
        loading: 'min-h-[inherit]',
        container:
          'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
        header: 'rounded-t-lg',
        content:
          'flex flex-col gap-3 rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10'
      }}
    >
      <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
        <MultiSelect
          options={chainOptions || []}
          value={selectedOptions.chain}
          onChange={onSelectChain}
          placeholder='Chain'
          disabled={isLoading}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.deployment}
          onChange={onSelectMarket}
          placeholder='Market'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <MultiSelect
          options={
            assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
            []
          }
          value={selectedOptions.assetType}
          onChange={onSelectAssetType}
          placeholder='Asset Type'
          disabled={isLoading}
        />
        <MultiSelect
          options={
            symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || []
          }
          value={selectedOptions.symbol}
          onChange={onSelectSymbol}
          placeholder='Reserve Symbols'
          disabled={isLoading}
        />
      </div>
      <div className='block px-5 py-3 lg:hidden'>
        <div className='flex flex-row items-center justify-end gap-2'>
          <Button
            onClick={onFilterOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name='filters'
              className='h-[14px] w-[14px] fill-none'
            />
            Filters
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={treasuryBalanceByNetworkColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
        <Filter
          isOpen={isFilterOpen}
          filterOptions={filterOptions}
          onClose={onFilterClose}
          onClearAll={onClearFilters}
        />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <div className='flex flex-col justify-between gap-0 md:gap-10 lg:flex-row'>
          <CryptoChart
            data={chartData}
            onClear={onClearFilters}
          />
          <TreasuryBalanceByNetwork
            sortType={sortType}
            tableData={tableData}
          />
        </div>
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <NoDataPlaceholder onButtonClick={onClearAll} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryBalanceByNetworkBlock;
