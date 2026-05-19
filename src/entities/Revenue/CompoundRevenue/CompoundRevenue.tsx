import React, { useEffect, useMemo, useReducer } from 'react';
import { useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import CompoundRevenueChart from '@/components/Charts/CompoundRevenue/CompoundRevenueChart';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions, type Option } from '@/shared/hooks/filters/useOptions';
import { useBarSize } from '@/shared/hooks/useBarSize';
import { type StackedChartData, useCompoundChartBars } from '@/shared/hooks/useCompoundChartBars';
import { useFiltersSync } from '@/shared/hooks/useFiltersSync';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { type RevenuePageProps } from '@/shared/hooks/useRevenue';
import { getMaxBarSizeForRange } from '@/shared/lib/date/dateUtils';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import { capitalizeFirstLetter, ChartDataItem, parseAsTimestampMs } from '@/shared/lib/utils/utils';
import { BAR_SIZE, BAR_SIZE_OPTIONS, OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const getChain = (item: ChartDataItem) => item.source?.network || 'N/A';
const getMarket = (item: ChartDataItem) => (item.source?.market === null ? NOT_MARKET : item.source?.market || 'N/A');
const getSource = (item: ChartDataItem) => item.source?.type || 'N/A';
const getSymbol = (item: ChartDataItem) => item.source?.asset?.symbol || 'N/A';

const BAR_SIZE_ORDER = {
  [BAR_SIZE.D]: 0,
  [BAR_SIZE.W]: 1,
  [BAR_SIZE.M]: 2,
} as const;

const keysToOptionTypes = (keys: string[], options: Option[]): OptionType[] =>
  keys.map((id) => {
    const found = options.find((o) => o.value === id);
    return { id, label: found?.label ?? capitalizeFirstLetter(id) };
  });

type CascadeSelection = {
  chain?: Option[];
  market?: Option[];
  source?: Option[];
};

const applyCascadeFilters = (data: ChartDataItem[], selected: CascadeSelection) => {
  let items = data;

  if (selected.chain?.length) {
    const chainIds = new Set(selected.chain.map((option) => option.value));
    items = items.filter((item) => chainIds.has(getChain(item)));
  }

  if (selected.market?.length) {
    const marketIds = new Set(selected.market.map((option) => option.value));
    items = items.filter((item) => marketIds.has(getMarket(item)));
  }

  if (selected.source?.length) {
    const sourceIds = new Set(selected.source.map((option) => option.value));
    items = items.filter((item) => sourceIds.has(getSource(item)));
  }

  return items;
};

const buildFilterOptions = (data: ChartDataItem[], getValue: (item: ChartDataItem) => string): Option[] =>
  [...new Set(data.map(getValue))]
    .filter(Boolean)
    .sort()
    .map((value) => ({ label: capitalizeFirstLetter(value), value }));

const CompoundRevenueBlock = ({ revenueData: data, isLoading, isError }: RevenuePageProps) => {
  const revenueData = data || [];

  const [selectedOptions, setSelectedOptions] = useReducer((prev, next) => ({ ...prev, ...next }), {
    chain: [] as OptionType[],
    source: [] as OptionType[],
    deployment: [] as OptionType[],
    symbol: [] as OptionType[],
  });

  useFiltersSync(selectedOptions, setSelectedOptions, 'cr', ['chain', 'source', 'deployment', 'symbol']);

  const [startDate, setStartDate] = useQueryState('cr-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('cr-end', parseAsTimestampMs);

  const { barSize, onBarSizeChange } = useBarSize({ initialBarSize: BAR_SIZE.M });

  const maxSelectableBarSize =
    startDate === null || endDate === null ? BAR_SIZE.M : getMaxBarSizeForRange(startDate, endDate);

  const disabledBarSizes = BAR_SIZE_OPTIONS.filter(
    (size) => BAR_SIZE_ORDER[size] > BAR_SIZE_ORDER[maxSelectableBarSize],
  );

  useEffect(() => {
    if (startDate === null || endDate === null) return;
    const nextBarSize = getMaxBarSizeForRange(startDate, endDate);
    if (BAR_SIZE_ORDER[nextBarSize] < BAR_SIZE_ORDER[barSize]) {
      onBarSizeChange(nextBarSize);
    }
  }, [barSize, startDate, endDate, onBarSizeChange]);

  const chainOptions = useMemo(() => buildFilterOptions(revenueData, getChain), [revenueData]);

  const { selectedOptions: selectedChainOptions, setSelectedOptions: setSelectedChainOptions } = useOptions(
    chainOptions,
    selectedOptions.chain.map((o) => o.id),
    (keys) => {
      const chain = keysToOptionTypes(keys, chainOptions);
      const chainFilter = keys.length ? chainOptions.filter((option) => keys.includes(option.value)) : [];
      const scoped = applyCascadeFilters(revenueData, { chain: chainFilter });
      const validMarkets = new Set(scoped.map(getMarket));
      const deployment = selectedOptions.deployment.filter((d) => validMarkets.has(d.id));
      setSelectedOptions({ chain, deployment });
    },
  );

  const marketOptions = useMemo(() => {
    const scoped = applyCascadeFilters(revenueData, { chain: selectedChainOptions });
    return buildFilterOptions(scoped, getMarket);
  }, [revenueData, selectedChainOptions]);

  const { selectedOptions: selectedMarketOptions, setSelectedOptions: setSelectedMarketOptions } = useOptions(
    marketOptions,
    selectedOptions.deployment.map((o) => o.id),
    (keys) => setSelectedOptions({ deployment: keysToOptionTypes(keys, marketOptions) }),
  );

  const sourceOptions = useMemo(() => {
    const scoped = applyCascadeFilters(revenueData, {
      chain: selectedChainOptions,
      market: selectedMarketOptions,
    });
    return buildFilterOptions(scoped, getSource);
  }, [revenueData, selectedChainOptions, selectedMarketOptions]);

  const { selectedOptions: selectedSourceOptions, setSelectedOptions: setSelectedSourceOptions } = useOptions(
    sourceOptions,
    selectedOptions.source.map((o) => o.id),
    (keys) => setSelectedOptions({ source: keysToOptionTypes(keys, sourceOptions) }),
  );

  const symbolOptions = useMemo(() => {
    const scoped = applyCascadeFilters(revenueData, {
      chain: selectedChainOptions,
      market: selectedMarketOptions,
      source: selectedSourceOptions,
    });
    return buildFilterOptions(scoped, getSymbol);
  }, [revenueData, selectedChainOptions, selectedMarketOptions, selectedSourceOptions]);

  const { selectedOptions: selectedSymbolOptions, setSelectedOptions: setSelectedSymbolOptions } = useOptions(
    symbolOptions,
    selectedOptions.symbol.map((o) => o.id),
    (keys) => setSelectedOptions({ symbol: keysToOptionTypes(keys, symbolOptions) }),
  );

  const processorConfig = useMemo(
    () => ({
      array: revenueData,
      filters: [
        (v: ChartDataItem) => !selectedChainOptions.length || selectedChainOptions.some((o) => o.value === getChain(v)),
        (v: ChartDataItem) =>
          !selectedMarketOptions.length || selectedMarketOptions.some((o) => o.value === getMarket(v)),
        (v: ChartDataItem) =>
          !selectedSourceOptions.length || selectedSourceOptions.some((o) => o.value === getSource(v)),
        (v: ChartDataItem) =>
          !selectedSymbolOptions.length || selectedSymbolOptions.some((o) => o.value === getSymbol(v)),
        (v: ChartDataItem) => startDate === null || v.date * 1000 >= startDate,
        (v: ChartDataItem) => endDate === null || v.date * 1000 <= endDate,
      ],
      transformer: () => {
        const dailyTotals = new Map<number, number>();

        return (v: ChartDataItem) => {
          const dateKey = v.date * 1000;
          dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + v.value);
          return dailyTotals;
        };
      },
    }),
    [
      revenueData,
      selectedChainOptions,
      selectedMarketOptions,
      selectedSourceOptions,
      selectedSymbolOptions,
      startDate,
      endDate,
    ],
  );

  const { result } = useProcessor(processorConfig);

  const stackedChartData = useMemo(() => {
    const dailyTotals = result as Map<number, number> | undefined;
    if (!dailyTotals?.size) return [];

    return [...dailyTotals.entries()]
      .sort(([a], [b]) => a - b)
      .map(([ts, revenue]) => ({
        date: new Date(ts).toISOString().split('T')[0],
        Revenue: revenue,
      })) satisfies StackedChartData[];
  }, [result]);

  const { aggregatedData, aggregatedSeries, seriesData, chartRef } = useCompoundChartBars({
    barSize,
    data: stackedChartData,
    customBarColor: '#4DEDB5',
  });

  const hasAggregatedData = aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0);

  const csvData = getSummarizedCsvData(aggregatedSeries);
  const hasData = stackedChartData.length > 0;

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedSourceOptions.length ||
    !!selectedSymbolOptions.length;

  const noDataMessage = isAnyFiltersSelected ? 'No data for selected filters' : 'No data available';

  const clearAllFilters = () => {
    setSelectedOptions({
      chain: [],
      source: [],
      deployment: [],
      symbol: [],
    });
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Card
      title='Compound Revenue'
      id='compound-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 p-0 px-0 pb-5 md:px-5 lg:pb-10',
      }}
    >
      <div className='flex flex-row items-center gap-2 py-3 max-lg:px-5 max-lg:md:px-0 sm:justify-end lg:gap-1.5'>
        <TabsGroup
          className={{
            container: 'min-w-0 max-sm:flex-1 sm:flex-none',
            list: 'w-full max-sm:w-full sm:w-auto lg:h-8',
          }}
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={onBarSizeChange}
          disabled={isLoading}
          disabledTabs={disabledBarSizes}
        />
        <div className='max-sm:flex-1 sm:flex-none lg:flex lg:items-center lg:gap-1.5 max-lg:[&_button]:grow-0 max-sm:[&_button]:w-full'>
          <Filters onClearAll={clearAllFilters} isShowClear={isAnyFiltersSelected}>
            <DateRangePickerFilter
              triggerLabel='Date Range'
              showLabels
              value={{ startDate, endDate }}
              onChange={({ startDate: nextStartDate, endDate: nextEndDate }) => {
                setStartDate(nextStartDate);
                setEndDate(nextEndDate);
              }}
            />
            <DropdownFilter
              triggerLabel='Chain'
              options={chainOptions}
              selectedOptions={selectedChainOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedChainOptions}
            />
            <DropdownFilter
              triggerLabel='Market'
              options={marketOptions}
              selectedOptions={selectedMarketOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedMarketOptions}
            />
            <DropdownFilter
              triggerLabel='Source'
              options={sourceOptions}
              selectedOptions={selectedSourceOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedSourceOptions}
            />
            <DropdownFilter
              triggerLabel='Reserve Symbols'
              options={symbolOptions}
              selectedOptions={selectedSymbolOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedSymbolOptions}
            />
          </Filters>
        </div>
        <ChartActions
          mobileChildren={<CSVDownloadButton data={csvData} filename={getCsvFileName('compound_revenue')} />}
        >
          <CSVDownloadButton data={csvData} filename={getCsvFileName('compound_revenue')} />
        </ChartActions>
      </div>
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} text={noDataMessage} />
      ) : (
        <div className='h-[400px]'>
          <CompoundRevenueChart
            resetZoomKey={`${barSize}-${startDate}-${endDate}`}
            chartRef={chartRef}
            seriesData={seriesData}
            aggregatedData={aggregatedData}
            barSize={barSize}
          />
        </div>
      )}
    </Card>
  );
};

export default CompoundRevenueBlock;
