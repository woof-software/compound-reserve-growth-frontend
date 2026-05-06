import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ChartActions } from '@/components/Charts/ChartActions';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import TreasuryHoldingsTable, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryHoldingsTable';
import { treasuryBalanceByNetworkColumns } from '@/entities/Treasury/TreasuryBalanceByNetwork/TreasuryBalanceByNetwork';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useUrlSyncStingsArray } from '@/shared/hooks/filters/useUrlSyncStingsArray';
import { useModal } from '@/shared/hooks/useModal';
import { SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import {
  capitalizeFirstLetter,
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import View from '@/shared/ui/View/View';

interface TreasuryHoldingsBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  data: TokenData[];
}

const mapTableData = (data: TokenData[]) => {
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

const TreasuryHoldingsBlock = ({
  isLoading,
  isError,
  data
}: TreasuryHoldingsBlockProps) => {
  const [, setSearchParams] = useSearchParams();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const [selectedChainKeys, setSelectedChainKeys] = useUrlSyncStingsArray('thb-chain', []);
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

  const [selectedMarketKeys, setSelectedMarketKeys] = useUrlSyncStingsArray('thb-market', []);
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

  const [selectedAssetTypesKeys, setSelectedAssetTypesKeys] = useUrlSyncStingsArray('thb-asset-type', []);
  const assetTypesOptions = useMemo(() => (
    [...new Set(byChainAndMarket.map(d => d.source.asset.type))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChainAndMarket]);

  const {
    selectedOptions: selectedAssetTypeOptions,
    setSelectedOptions: setSelectedAssetTypeOptions,
  } = useOptions(assetTypesOptions, selectedAssetTypesKeys, setSelectedAssetTypesKeys);

  const byChainMarketAndAsset = useMemo(() => (
    !selectedAssetTypeOptions.length
      ? byChainAndMarket
      : byChainAndMarket.filter(d => selectedAssetTypeOptions.some(o => o.value === d.source.asset.type))
  ), [byChainAndMarket, selectedAssetTypeOptions]);

  const [selectedSymbolKeys, setSelectedSymbolKeys] = useUrlSyncStingsArray('thb-symbol', []);
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

  const isAnyFiltersSelected =
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedAssetTypeOptions.length ||
    !!selectedSymbolOptions.length;

  const onClearAll = () => {
    setSearchParams({});
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
      
      if (
        selectedMarketOptions.length > 0 &&
        !selectedMarketOptions.some((o) =>
          o.value === (item.source.market ?? NOT_MARKET)
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

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Full Treasury Holdings'
      id='full-treasury-holdings'
      className={{
        loading: 'min-h-[inherit]',
        container:
          'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
        content: 'rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10',
        header: 'rounded-t-lg'
      }}
    >
      <div className={'flex items-center gap-2 py-3 px-5 lg:px-0 justify-end flex-wrap'}>
        <Filters
          onClearAll={onClearAll}
          isShowClear={isAnyFiltersSelected}
        >
          <DropdownFilter
            triggerLabel={'Chain'}
            options={chainOptions}
            selectedOptions={selectedChainOptions}
            onSelect={setSelectedChainOptions}
          />
          <DropdownFilter
            triggerLabel={'Market'}
            options={marketOptions}
            selectedOptions={selectedMarketOptions}
            onSelect={setSelectedMarketOptions}
          />
          <DropdownFilter
            triggerLabel={'Asset Type'}
            options={assetTypesOptions}
            selectedOptions={selectedAssetTypeOptions}
            onSelect={setSelectedAssetTypeOptions}
          />
          <DropdownFilter
            triggerLabel={'Reserve Symbol'}
            options={reserveSymbolOptions}
            selectedOptions={selectedSymbolOptions}
            onSelect={setSelectedSymbolOptions}
          />
        </Filters>
          <Button
            onClick={onSortOpen}
            className="lg:hidden cursor-pointer items-center justify-center transition bg-secondary-27 text-gray-11 shadow-13 flex h-9 grow md:max-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8">
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
        <ChartActions
          mobileChildren={
            <>
              <CSVDownloadButton
                data={tableData}
                filename={getCsvFileName('total_treasury_value')}
              />
            </>
          }
        >
          <CSVDownloadButton
            data={tableData}
            filename={getCsvFileName('total_treasury_value')}
          />
        </ChartActions>
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <TreasuryHoldingsTable
          sortType={sortType}
          tableData={tableData}
        />
      </View.Condition>
      <View.Condition if={Boolean(!isLoading && !isError && !tableData.length)}>
        <NoDataPlaceholder onButtonClick={onClearAll} />
      </View.Condition>
    </Card>
  );
};

export default TreasuryHoldingsBlock;
