import React, { useCallback, useMemo, useReducer } from 'react';
import { CSVLink } from 'react-csv';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import Filter from '@/components/Filter/Filter';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import TreasuryHoldings, {
  TreasuryBalanceByNetworkType
} from '@/components/TreasuryPageTable/TreasuryHoldings';
import { treasuryBalanceByNetworkColumns } from '@/entities/Treasury/TreasuryBalanceByNetwork';
import { useModal } from '@/shared/hooks/useModal';
import {
  capitalizeFirstLetter,
  extractFilterOptions
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
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
      market: el.source.market ?? 'no market',
      qty: humanReadableQuantity,
      value: el.value,
      price: el.price,
      source: el.source.type,
      address: el.source.address
    };
  });
};

export const treasuryHoldingsColumns = [
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
    header: 'qty'
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

const TreasuryHoldingsBlock = ({
  isLoading,
  isError,
  data
}: TreasuryHoldingsBlockProps) => {
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

  const {
    isOpen: isMoreOpen,
    onOpenModal: onMoreOpen,
    onCloseModal: onMoreClose
  } = useModal();

  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      assetType: [] as OptionType[],
      deployment: [] as OptionType[],
      symbol: [] as OptionType[]
    }
  );

  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

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
    const marketV2 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = deploymentOptions?.find(
      (el) => el.id.toLowerCase() === 'no name'
    );

    const selectedChainIds = selectedOptions.chain.map((o) => o.id);

    let allMarkets = [...marketV3, ...marketV2];

    if (noMarkets) {
      allMarkets = [...allMarkets, noMarkets];
    }

    if (selectedChainIds.length) {
      return allMarkets.filter(
        (el) => el.chain?.some((c) => selectedChainIds.includes(c)) ?? false
      );
    }

    return allMarkets;
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

  const onKeySelect = useCallback((value: string) => {
    setSortType({
      key: value
    });
  }, []);

  const onTypeSelect = useCallback((value: string) => {
    setSortType({
      type: value
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
      <div className='hidden items-center justify-end gap-3 px-10 py-3 lg:flex lg:px-0'>
        <MultiSelect
          options={chainOptions || []}
          value={selectedOptions.chain}
          onChange={onSelectChain}
          placeholder='Chain'
          disabled={isLoading}
        />
        <MultiSelect
          options={deploymentOptionsFilter || []}
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
        <CSVDownloadButton
          data={tableData}
          filename='Full Treasury Holdings'
        />
      </div>
      <div className='block lg:hidden'>
        <div className='flex flex-row items-center justify-end gap-2 px-5 py-3'>
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
          <Button
            onClick={onMoreOpen}
            className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
          >
            <Icon
              name='3-dots'
              className='h-6 w-6 fill-none'
            />
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
          onClearAll={onClearAll}
        />
        <Drawer
          isOpen={isMoreOpen}
          onClose={onMoreClose}
        >
          <Text
            size='17'
            weight='700'
            align='center'
            className='mb-5'
          >
            Actions
          </Text>
          <div className='flex flex-col gap-1.5'>
            <div className='px-3 py-2'>
              <CSVLink
                data={tableData}
                filename='Full Treasury Holdings'
                onClick={onMoreClose}
              >
                <div className='flex items-center gap-1.5'>
                  <Icon
                    name='download'
                    className='h-[26px] w-[26px]'
                  />
                  <Text
                    size='14'
                    weight='500'
                  >
                    CSV with the entire historical data
                  </Text>
                </div>
              </CSVLink>
            </div>
          </div>
        </Drawer>
      </div>
      <View.Condition if={Boolean(!isLoading && !isError && tableData.length)}>
        <TreasuryHoldings
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
