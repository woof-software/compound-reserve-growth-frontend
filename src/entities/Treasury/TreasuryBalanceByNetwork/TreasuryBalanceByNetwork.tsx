import React, { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import BarChart from '@/components/Charts/Bar/Bar';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryBalanceByNetworkTable, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryBalanceByNetworkTable';
import { customChartOptions } from '@/entities/Treasury/TreasuryBalanceByNetwork/customChartOptions';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import { capitalizeFirstLetter, colorPicker,  parseStingsArray } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
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
      market: el.source.market ?? NOT_MARKET,
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
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('tbbn-chain', parseStingsArray(['mainnet']));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('tbbn-market', parseStingsArray([]));
  const [selectedAssetTypesKeys, setSelectedAssetTypeKeys] = useQueryState('tbbn-asset-type', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('tbbn-symbol', parseStingsArray([]));


  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setSelectedAssetTypeKeys([]);
    setSelectedSymbolKeys([]);
  };

  const chainOptions = useMemo(() => (
    [...new Set(data.map(d => d.source.network))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [data]);

  const {
    selectedOptions: selectedChainOptions,
    setSelectedOptions: setSelectedChainOptions,
  } = useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const byChain = useMemo(() => (
    !selectedChainOptions.length
      ? data
      : data.filter(d => selectedChainOptions.some(o => o.value === d.source.network))
  ), [data, selectedChainOptions]);

  const marketOptions = useMemo(() => (
    [...new Set(byChain.map(d => d.source.market ?? NOT_MARKET))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChain]);

  const {
    selectedOptions: selectedMarketOptions,
    setSelectedOptions: setSelectedMarketOptions,
  } = useOptions(marketOptions, selectedMarketKeys, setSelectedMarketKeys);

  const byChainAndMarket = useMemo(() => (
    !selectedMarketOptions.length
      ? byChain
      : byChain.filter(d => selectedMarketOptions.some(o => o.value === (d.source.market ?? NOT_MARKET)))
  ), [byChain, selectedMarketOptions]);

  const assetTypesOptions = useMemo(() => (
    [...new Set(byChainAndMarket.map(d => d.source.asset.type))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChainAndMarket]);

  const {
    selectedOptions: selectedAssetTypeOptions,
    setSelectedOptions: setSelectedAssetTypeOptions,
  } = useOptions(assetTypesOptions, selectedAssetTypesKeys, setSelectedAssetTypeKeys);

  const byChainMarketAndAsset = useMemo(() => (
    !selectedAssetTypeOptions.length
      ? byChainAndMarket
      : byChainAndMarket.filter(d => selectedAssetTypeOptions.some(o => o.value === d.source.asset.type))
  ), [byChainAndMarket, selectedAssetTypeOptions]);

  const reserveSymbolOptions = useMemo(() => (
    [...new Set(byChainMarketAndAsset.map(d => d.source.asset.symbol))]
      .filter(Boolean)
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChainMarketAndAsset]);

  const {
    selectedOptions: selectedSymbolOptions,
    setSelectedOptions: setSelectedSymbolOptions,
  } = useOptions(reserveSymbolOptions, selectedSymbolKeys, setSelectedSymbolKeys);

  const { sortKey, sortDirection, onKeySelect, onTypeSelect } =
    useSorting<TreasuryBalanceByNetworkType>('asc', null);

  const sortType: SortAdapter<TreasuryBalanceByNetworkType> = {
    type: sortDirection,
    key: sortKey
  };

  const tableData = useMemo<TreasuryBalanceByNetworkType[]>(() => {
    const filtered = data.filter((item) => {
      if (
        selectedChainOptions.length > 0 &&
        !selectedChainOptions.some(
          (o) => o.value === item.source.network
        )
      ) {
        return false;
      }

      if (
        selectedAssetTypeOptions.length > 0 &&
        !selectedAssetTypeOptions.some(
          (o) => o.value === item.source.asset.type
        )
      ) {
        return false;
      }

      const market = item.source.market ?? NOT_MARKET;

      if (
        selectedMarketOptions.length > 0 &&
        !selectedMarketOptions.some((o) =>
          o.value === NOT_MARKET ? market === NOT_MARKET : o.value === market
        )
      ) {
        return false;
      }

      if (
        selectedSymbolOptions.length > 0 &&
        !selectedSymbolOptions.some(
          (o) => o.value === item.source.asset.symbol
        )
      ) {
        return false;
      }

      return true;
    });

    return mapTableData(filtered).sort((a, b) => b.value - a.value);
  }, [data, selectedChainOptions, selectedAssetTypeOptions, selectedMarketOptions, selectedSymbolOptions]);

  const chartData = useMemo(() => {
    return tableData
      .map((item, index) => ({
        name: item.symbol,
        value: item.value,
        color: colorPicker(index)
      }))
      .filter((el) => el.value > 0);
  }, [tableData]);

  const isAnyFiltersSelected =
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedAssetTypeOptions.length ||
    !!selectedSymbolOptions.length;

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
      <div className='flex items-center justify-end gap-2 px-5 py-3 lg:px-0'>
        <Filters
          onClearAll={clearAllFilters}
          isShowClear={isAnyFiltersSelected}
        >
          <DropdownFilter
            triggerLabel={'Chain'}
            options={chainOptions}
            selectedOptions={selectedChainOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedChainOptions}
          />
          <DropdownFilter
            triggerLabel={'Market'}
            options={marketOptions}
            selectedOptions={selectedMarketOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedMarketOptions}
          />
          <DropdownFilter
            triggerLabel={'Asset Type'}
            options={assetTypesOptions}
            selectedOptions={selectedAssetTypeOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedAssetTypeOptions}
          />
          <DropdownFilter
            triggerLabel={'Reserve Symbol'}
            options={reserveSymbolOptions}
            selectedOptions={selectedSymbolOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedSymbolOptions}
          />
        </Filters>
        <Button
          onClick={onSortOpen}
          className="cursor-pointer lg:hidden items-center justify-center transition bg-secondary-27 text-gray-11 shadow-13 flex h-9 grow sm:max-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8"
        >
          <Icon
            name='sort-icon'
            className='h-[14px] w-[14px]'
          />
          Sort
        </Button>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={treasuryBalanceByNetworkColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <div className='flex flex-col justify-between gap-0 md:gap-10 lg:flex-row'>
          <BarChart
            customOptions={customChartOptions}
            data={chartData}
            onClear={clearAllFilters}
          />
          <TreasuryBalanceByNetworkTable
            sortType={sortType}
            tableData={tableData}
          />
        </div>
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <NoDataPlaceholder onButtonClick={clearAllFilters} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryBalanceByNetworkBlock;
