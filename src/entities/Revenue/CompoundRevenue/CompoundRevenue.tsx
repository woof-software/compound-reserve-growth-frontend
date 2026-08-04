import { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import CompoundRevenueChart from '@/components/Charts/CompoundRevenue/CompoundRevenueChart';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {type RevenueProps } from '@/pages/AccountingPage/AccountingPage';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { type StackedChartData, useCompoundChartBars } from '@/shared/hooks/useCompoundChartBars';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import { capitalizeFirstLetter, ChartDataItem, parseAsTimestampMs, parseStingsArray } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const CompoundRevenueBlock = (props: RevenueProps) => {
  const { revenueData, isLoading, isError } = props;

  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('ttv-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('ttv-market', parseStingsArray([]));
  const [selectedAssetTypesKeys, setSelectedAssetTypeKeys] = useQueryState('ttv-asset-type', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('ttv-symbol', parseStingsArray([]));
  const [startDate, setStartDate] = useQueryState('cr-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('cr-end', parseAsTimestampMs);

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setSelectedAssetTypeKeys([]);
    setSelectedSymbolKeys([]);
    setStartDate(null);
    setEndDate(null);
  };

  const {barSize, onBarSizeChange, disabledBarSizes} = useBarSizeWithDateRange({startDate, endDate});

  const chainOptions = useMemo(() => (
    [...new Set(revenueData.map(d => d.source.network))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [revenueData]);

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
      ? revenueData
      : revenueData.filter(d => selectedChainOptionsSet.has(d.source.network))
  ), [revenueData, selectedChainOptions]);

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

  const byChainAndMarket = useMemo(() => (
    !selectedMarketOptions.length
      ? byChain
      : byChain.filter(d => selectedMarketOptionsSet.has(d.source.market ?? NOT_MARKET))
  ), [byChain, selectedMarketOptions]);

  const sourceOptions = useMemo(() => (
    [...new Set(byChainAndMarket.map(d => d.source.type))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChainAndMarket]);

  const {
    selectedOptions: selectedSourceOptions,
    setSelectedOptions: setSelectedSourceOptions,
  } = useOptions(sourceOptions, selectedAssetTypesKeys, setSelectedAssetTypeKeys);

  const selectedSourceOptionsSet = useMemo(
    () => new Set(selectedSourceOptions.map(o => o.value)),
    [selectedSourceOptions]
  );

  const byChainMarketAndSource = useMemo(() => (
    !selectedSourceOptions.length
      ? byChainAndMarket
      : byChainAndMarket.filter(d => selectedSourceOptionsSet.has(d.source.type))
  ), [byChainAndMarket, selectedSourceOptions]);

  const symbolOptions = useMemo(() => (
    [...new Set(byChainMarketAndSource.map(d => d.source.asset.symbol))]
      .filter(Boolean)
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChainMarketAndSource]);

  const {
    selectedOptions: selectedSymbolOptions,
    setSelectedOptions: setSelectedSymbolOptions,
  } = useOptions(symbolOptions, selectedSymbolKeys, setSelectedSymbolKeys);

  const selectedSymbolOptionsSet = useMemo(
    () => new Set(selectedSymbolOptions.map(o => o.value)),
    [selectedSymbolOptions]
  );

  const { result } = useProcessor({
    array: revenueData,
    filters: [
      (v) => v.value > 0,
      (v) => !selectedChainOptions.length || selectedChainOptionsSet.has(v.source.network),
      (v) => !selectedMarketOptions.length || selectedMarketOptionsSet.has(v.source.market ?? NOT_MARKET),
      (v) => !selectedSourceOptions.length || selectedSourceOptionsSet.has(v.source.type),
      (v) => !selectedSymbolOptions.length || selectedSymbolOptionsSet.has(v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => endDate === null || v.date * 1000 <= endDate,
    ],
    transformer: () => {
      const dailyTotals = new Map<number, number>();

      return (v: ChartDataItem) => {
        const dateKey = v.date * 1000;
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + v.value);
        return dailyTotals;
      };
    },
  });

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

  const hasAggregatedData = aggregatedSeries.some(({ data }) => data?.length);

  const hasData = stackedChartData.length > 0;

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedSourceOptions.length ||
    !!selectedSymbolOptions.length;

  const noDataMessage = isAnyFiltersSelected ? 'No data for selected filters' : 'No data available';

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
          mobileChildren={
          <CSVDownloadButton
            data={getSummarizedCsvData(aggregatedSeries)}
            filename={getCsvFileName('compound_revenue')}
          />
        }
        >
          <CSVDownloadButton
            data={getSummarizedCsvData(aggregatedSeries)}
            filename={getCsvFileName('compound_revenue')}
          />
        </ChartActions>
      </div>
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} text={noDataMessage} />
      ) : (
        <div className='h-100'>
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
