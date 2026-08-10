import { useMemo } from 'react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import DailyExpensesTable from '@/entities/Insentive/DailyExpenses/DailyExpensesTable';
import { normalizeTableData } from '@/entities/Insentive/DailyExpenses/lib/normalizeTableData';
import { NormalizedTableData } from '@/entities/Insentive/DailyExpenses/lib/types';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useModal } from '@/shared/hooks/useModal';
import { SortAccessor, SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { capitalizeFirstLetter, parseStingsArray } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface DailyExpensesProps {
  isLoading?: boolean;
  isError?: boolean;
  data: CombinedIncentivesData[];
}

const currencyValues = ['COMP', 'USD'] as const;

const sortColumns: SortAccessor<NormalizedTableData>[] = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'market', header: 'Market' },
  { accessorKey: 'lendIncentive', header: 'Lend Incentive' },
  { accessorKey: 'borrowIncentive', header: 'Borrow Incentive' },
  { accessorKey: 'total', header: 'Total' }
];

const DailyExpenses = ({ isLoading, isError, data }: DailyExpensesProps) => {
  const [activeCurrencyTab, setActiveCurrencyTab] = useQueryState(
    'de-currency',
    parseAsStringLiteral(currencyValues).withDefault('COMP')
  );
  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('de-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('de-market', parseStingsArray([]));
  
  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
  };

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const chainOptions = useMemo(() => {
    const uniqueNetworks = [...new Set(data.map(d => d.source.network))];
    const filteredNetworks = uniqueNetworks.filter(network => network !== 'mainnet');
    const optionNetworks = filteredNetworks.map(network => ({ label: capitalizeFirstLetter(network), value: network }));

    return [
      { label: 'Mainnet', value: 'mainnet' },
      ...optionNetworks
    ];
  }, [data]);

  const {
    selectedOptions: selectedChainOptions,
    setSelectedOptions: setSelectedChainOptions,
  } = useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const selectedChainOptionsSet = useMemo(
    () => new Set(selectedChainOptions.map(o => o.value)),
    [selectedChainOptions]
  );

  const byChain = useMemo(() => (
    !selectedChainOptions.length
      ? data
      : data.filter(d => selectedChainOptionsSet.has(d.source.network))
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

  const selectedMarketOptionsSet = useMemo(
    () => new Set(selectedMarketOptions.map(o => o.value)),
    [selectedMarketOptions]
  );

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    let result = data;

    const latestDate = result.reduce(
      (max, item) => (item.date > max ? item.date : max),
      result[0].date
    );
    result = result.filter((item) => item.date === latestDate);

    if (selectedChainOptions.length > 0) {
      result = result.filter((item) =>
        selectedChainOptionsSet.has(item.source.network)
      );
    }

    if (selectedMarketOptions.length > 0) {
      result = result.filter((item) =>
        selectedMarketOptionsSet.has(item.source.market ?? NOT_MARKET)
      );
    }

    return result;
  }, [data, selectedChainOptions, selectedMarketOptions]);

  const isAnyFiltersSelected = !!selectedChainOptions.length || !!selectedMarketOptions.length;

  const normalizedTableData = normalizeTableData(filteredData, activeCurrencyTab);
  
  const { sortDirection, sortKey, onKeySelect, onTypeSelect } = useSorting<NormalizedTableData>('desc', 'total');

  const sortType: SortAdapter<NormalizedTableData> = {
    type: sortDirection,
    key: sortKey
  };

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Daily expenses'
      id='daily-expenses'
      className={{
        loading: 'min-h-[inherit]',
        container:
          'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
        content: 'rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10',
        header: 'rounded-t-lg'
      }}
    >
      <div className='hidden items-center justify-end gap-2 px-5 lg:px-0 py-3 sm:flex'>
        <TabsGroup
          tabs={['COMP', 'USD']}
          value={activeCurrencyTab}
          onTabChange={setActiveCurrencyTab}
        />
        <Filters isShowClear={isAnyFiltersSelected} onClearAll={clearAllFilters}>
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
        </Filters>
        <Button
          onClick={onSortOpen}
          className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
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
          columns={sortColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
        <ChartActions
          mobileChildren={
            <CSVDownloadButton
              data={() => (
                normalizedTableData.map((item) => ({
                  network: item.network,
                  market: item.market,
                  lendIncentive: item.lendIncentive,
                  borrowIncentive: item.borrowIncentive,
                  total: item.total,
                  source: item.source.address
                }))
              )}
              filename={getCsvFileName('incentives_daily_expenses', { view: activeCurrencyTab })}
            />
          }
        >
          <CSVDownloadButton
            data={() => (
              normalizedTableData.map((item) => ({
                network: item.network,
                market: item.market,
                lendIncentive: item.lendIncentive,
                borrowIncentive: item.borrowIncentive,
                total: item.total,
                source: item.source.address
              }))
            )}
            filename={getCsvFileName('incentives_daily_expenses', { view: activeCurrencyTab })}
          />
        </ChartActions>
      </div>
      {/*mobile styles*/}
      <div className='sm:hidden flex flex-col items-center justify-end gap-2 px-5 py-3 sm:flex-row'>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <Filters isShowClear={isAnyFiltersSelected} onClearAll={clearAllFilters}>
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
          </Filters>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
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
            columns={sortColumns}
            onClose={onSortClose}
            onKeySelect={onKeySelect}
            onTypeSelect={onTypeSelect}
          />
        </div>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <TabsGroup
            className={{
              container: 'block w-full sm:hidden sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['COMP', 'USD']}
            value={activeCurrencyTab}
            onTabChange={setActiveCurrencyTab}
          />
          <ChartActions
            mobileChildren={
              <CSVDownloadButton
                data={() => (
                  normalizedTableData.map((item) => ({
                    network: item.network,
                    market: item.market,
                    lendIncentive: item.lendIncentive,
                    borrowIncentive: item.borrowIncentive,
                    total: item.total,
                    source: item.source.address
                  }))
                )}
                filename={getCsvFileName('incentives_daily_expenses', { view: activeCurrencyTab })}
              />
            }
          >
            <></>
          </ChartActions>
        </div>
      </div>
      {!isLoading && !isError && (
        normalizedTableData.length ? (
          <DailyExpensesTable
            activeViewTab={activeCurrencyTab}
            sortType={sortType}
            tableData={normalizedTableData}
          />
        ) : (
          <NoDataPlaceholder onButtonClick={clearAllFilters} />
        )
      )}
    </Card>
  );
};

export default DailyExpenses;
