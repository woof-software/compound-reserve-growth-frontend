import React, { useCallback, useMemo, useReducer, useState } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import {
  MultiSelect,
  MultiSelectDrawer
} from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
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
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import CheckStroke from '@/assets/svg/check-stroke.svg';

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

  const [sortType, setSortType] = useState<{
    key: string;
    type: string;
  }>({ key: 'symbol', type: 'asc' });

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

  const onSortTypeByKeySelect = useCallback(
    (value: string) => {
      setSortType({
        ...sortType,
        key: value
      });
    },
    [sortType]
  );

  const onSortTypeByTypeSelect = useCallback(
    (value: string) => {
      setSortType({
        ...sortType,
        type: value
      });
    },
    [sortType]
  );

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
      <div className='hidden items-center justify-end gap-3 px-10 py-3 md:flex lg:px-0'>
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
      <div className='block md:hidden'>
        <div className='flex flex-wrap items-center justify-end gap-3 px-5 py-3'>
          <Button
            onClick={onFilterOpen}
            className='bg-secondary-27 outline-secondary-18 text-gray-11 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold outline-[0.25px]'
          >
            <Icon
              name='filters'
              className='h-[14px] w-[14px]'
            />
            Filters
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 outline-secondary-18 text-gray-11 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold outline-[0.25px]'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
          <CSVDownloadButton
            data={tableData}
            filename='Full Treasury Holdings'
          />
        </div>
        <Drawer
          isOpen={isSortOpen}
          onClose={onSortClose}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            Sort
          </Text>
          <div className='grid gap-3 px-2'>
            <div className='grid gap-4'>
              <Text
                size='14'
                weight='700'
                lineHeight='140'
                align='center'
                className='w-full'
              >
                Sort type
              </Text>
              <Each
                data={[
                  { type: 'asc', header: 'Ascending' },
                  {
                    type: 'desc',
                    header: 'Descending'
                  }
                ]}
                render={(el) => (
                  <div
                    className='flex items-center justify-between'
                    key={el.type}
                    onClick={() => onSortTypeByTypeSelect(el.type)}
                  >
                    <Text
                      size='14'
                      weight='500'
                      lineHeight='16'
                    >
                      {el.header}
                    </Text>
                    <View.Condition if={el.type === sortType?.type}>
                      <CheckStroke
                        width={16}
                        height={16}
                      />
                    </View.Condition>
                  </div>
                )}
              />
            </div>
            <div className='grid gap-4'>
              <Text
                size='14'
                weight='700'
                lineHeight='140'
                align='center'
                className='w-full'
              >
                Columns
              </Text>
              <Each
                data={treasuryBalanceByNetworkColumns}
                render={(el) => (
                  <div
                    className='flex items-center justify-between'
                    key={el.accessorKey}
                    onClick={() => onSortTypeByKeySelect(el.accessorKey)}
                  >
                    <Text
                      size='14'
                      weight='500'
                      lineHeight='16'
                    >
                      {el.header}
                    </Text>
                    <View.Condition if={el.accessorKey === sortType?.key}>
                      <CheckStroke
                        width={16}
                        height={16}
                      />
                    </View.Condition>
                  </div>
                )}
              />
            </div>
          </div>
        </Drawer>
        <Drawer
          isOpen={isFilterOpen}
          onClose={onFilterClose}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            Filters
          </Text>
          <div className='grid gap-3 px-2'>
            <MultiSelectDrawer
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelectDrawer
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelectDrawer
              options={
                assetTypeOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.assetType}
              onChange={onSelectAssetType}
              placeholder='Asset Type'
              disabled={isLoading}
            />
            <MultiSelectDrawer
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <div className='w-full px-2'>
            <Button
              className='bg-secondary-14 mx-2 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'
              onClick={onClearAll}
            >
              Clear Filters
            </Button>
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
