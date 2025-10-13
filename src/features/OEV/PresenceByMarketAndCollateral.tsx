import { FC, useCallback, useMemo, useReducer } from 'react';
import { CSVLink } from 'react-csv';

import Filter from '@/components/Filter/Filter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import PresenceByMarketAndCollateralTable, {
  TreasuryBalanceByNetworkType
} from '@/entities/OEV/PresenceByMarketAndCollateralTable';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import {
  capitalizeFirstLetter,
  extractFilterOptions
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface CurrentSpendingByChainProps {
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
      source: el.source.type,
      address: el.source.address
    };
  });
};

const treasuryBalanceByNetworkColumns: SortAccessor<TreasuryBalanceByNetworkType>[] =
  [
    {
      accessorKey: 'symbol',
      header: 'Source'
    },
    {
      accessorKey: 'qty',
      header: 'Chain'
    },
    {
      accessorKey: 'value',
      header: 'Market'
    },
    {
      accessorKey: 'source',
      header: 'OEV on Collateral'
    },
    {
      accessorKey: 'source',
      header: 'Price Feed'
    }
  ];

const PresenceByMarketAndCollateral: FC<CurrentSpendingByChainProps> = ({
  isLoading,
  isError,
  data
}) => {
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
      market: [] as OptionType[],
      presence: [] as OptionType[],
      priceFeed: [] as OptionType[]
    }
  );

  const { sortKey, sortDirection, onKeySelect, onTypeSelect } =
    useSorting<TreasuryBalanceByNetworkType>('asc', null);

  const sortType: SortAdapter<TreasuryBalanceByNetworkType> = {
    type: sortDirection,
    key: sortKey
  };

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' },
      presence: { path: 'source.market' },
      priceFeed: { path: 'source.market' }
    }),
    []
  );

  const { chainOptions, marketOptions } = useMemo(
    () => extractFilterOptions(data, filterOptionsConfig),
    [data, filterOptionsConfig]
  );

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = marketOptions?.find(
      (el) => el.id.toLowerCase() === NOT_MARKET.toLowerCase()
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
  }, [marketOptions, selectedOptions]);

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

      const market = item.source.market ?? NOT_MARKET;

      if (
        selectedOptions.market.length > 0 &&
        !selectedOptions.market.some((o: OptionType) =>
          o.id === NOT_MARKET ? market === NOT_MARKET : o.id === market
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

      const filteredDeployment = selectedOptions.market.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );
      setSelectedOptions({ chain, deployment: filteredDeployment });
    },
    [selectedOptions.market]
  );

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      market: [],
      presence: [],
      priceFeed: []
    });
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

  const onClearFilters = useCallback(() => {
    setSelectedOptions({
      chain: [],
      market: [],
      presence: [],
      priceFeed: []
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
      total: selectedOptions.market.length,
      selectedOptions: selectedOptions.market,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    const presenceFilterOptions = {
      id: 'market',
      placeholder: 'OEV presence',
      total: selectedOptions.market.length,
      selectedOptions: selectedOptions.market,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    const priceFeedFilterOptions = {
      id: 'market',
      placeholder: 'Price Feed',
      total: selectedOptions.market.length,
      selectedOptions: selectedOptions.market,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    return [
      chainFilterOptions,
      marketFilterOptions,
      presenceFilterOptions,
      priceFeedFilterOptions
    ];
  }, [
    chainOptions,
    deploymentOptionsFilter,
    onSelectChain,
    onSelectMarket,
    selectedOptions
  ]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='OEV presence by market and collateral'
      id='oev-presence-by-market-and-collateral'
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
          value={selectedOptions.market}
          onChange={onSelectMarket}
          placeholder='Market'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.market}
          onChange={onSelectMarket}
          placeholder='OEV presence'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.market}
          onChange={onSelectMarket}
          placeholder='Price Feed'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <CSVDownloadButton
          data={tableData}
          tooltipContent='Data can be downloaded in CSV'
          filename='OEV presence by market and collateral'
        />
      </div>
      <div className='block px-5 py-3 lg:hidden'>
        <div className='flex flex-col items-center justify-end gap-2 sm:flex-row'>
          <div className='flex w-full items-center gap-2 sm:w-auto'>
            <Button
              onClick={onFilterOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px] fill-none'
              />
              Filters
            </Button>
            <Button
              onClick={onSortOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
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
                filename='OEV presence by market and collateral'
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
        <div className='flex flex-col justify-between gap-0 md:gap-10 lg:flex-row'>
          <PresenceByMarketAndCollateralTable
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

export default PresenceByMarketAndCollateral;
