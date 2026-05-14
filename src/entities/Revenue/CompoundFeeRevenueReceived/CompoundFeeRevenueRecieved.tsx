import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryState } from 'nuqs';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { ChartActions } from '@/components/Charts/ChartActions';
import CompoundFeeRecievedChart from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecievedChart';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import { GroupFilter } from '@/components/Filter/GroupFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter,
} from '@/entities/Revenue/CompoundFeeRevenueReceived/customChartOptions';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { type StackedChartData, useCompoundChartBars } from '@/shared/hooks/useCompoundChartBars';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { RevenueItem, RevenuePageProps } from '@/shared/hooks/useRevenue';
import { getEndOfDayTimestamp } from '@/shared/lib/date/dateUtils';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import {
  capitalizeFirstLetter,
  filterAndSortMarkets,
  parseAsTimestampMs,
  parseStingsArray,
} from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const toOptionDto = (o: OptionType) => ({ label: o.label, value: o.id });

const groupByChartLabel: Record<string, string> = {
  none: 'None',
  assetType: 'Asset Type',
  chain: 'Chain',
  deployment: 'Market',
};

const CompoundFeeRevenueRecieved = ({ revenueData: rawData, isLoading, isError }: RevenuePageProps) => {
  const [resetHiddenKey, setResetHiddenKey] = useState(0);

  const [selectedGroupKey, setSelectedGroupKey] = useQueryState('cfrr-group', { defaultValue: 'chain' });
  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('cfrr-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('cfrr-market', parseStingsArray([]));
  const [selectedAssetTypesKeys, setSelectedAssetTypeKeys] = useQueryState('cfrr-asset-type', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('cfrr-symbol', parseStingsArray([]));
  const [startDate, setStartDate] = useQueryState('cfrr-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('cfrr-end', parseAsTimestampMs);

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setSelectedAssetTypeKeys([]);
    setSelectedSymbolKeys([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedGroupKey('chain');
    setResetHiddenKey((k) => k + 1);
  };

  const rangeEndMs = useMemo(() => (endDate === null ? null : getEndOfDayTimestamp(endDate)), [endDate]);

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange({ startDate, endDate });

  const sortedRaw = useMemo(() => [...rawData].sort((a, b) => a.date - b.date), [rawData]);

  const groupByOptions = useMemo(
    () => [
      { label: 'None', value: 'none' },
      { label: 'Asset Type', value: 'assetType' },
      { label: 'Chain', value: 'chain' },
      { label: 'Market', value: 'deployment' },
    ],
    [],
  );

  const selectedGroupOption = useMemo(() => {
    const el = groupByOptions.find(({ value }) => value === selectedGroupKey);
    if (!el) throw new Error('Selected group option not found');
    return el;
  }, [groupByOptions, selectedGroupKey]);

  const chainOptions = useMemo(
    () =>
      [...new Set(sortedRaw.map((d) => d.source.network))]
        .sort()
        .map((value) => ({ label: capitalizeFirstLetter(value), value })),
    [sortedRaw],
  );

  const { selectedOptions: selectedChainOptions, setSelectedOptions: setSelectedChainOptions } = useOptions(
    chainOptions,
    selectedChainKeys,
    setSelectedChainKeys,
  );

  const byChain = useMemo(
    () =>
      !selectedChainOptions.length
        ? sortedRaw
        : sortedRaw.filter((d) => selectedChainOptions.some((o) => o.value === d.source.network)),
    [sortedRaw, selectedChainOptions],
  );

  const marketOptionsEnriched = useMemo(() => {
    const metaByMarket = new Map<string, { chains: Set<string>; marketType: string }>();

    byChain.forEach((item) => {
      const m = item.source.market ?? NOT_MARKET;
      let entry = metaByMarket.get(m);
      if (!entry) {
        entry = {
          chains: new Set(),
          marketType: item.source.type?.split(' ')[1] ?? '',
        };
        metaByMarket.set(m, entry);
      }
      entry.chains.add(item.source.network);
    });

    const base: OptionType[] = Array.from(metaByMarket.entries()).map(([id, meta]) => ({
      id,
      label: capitalizeFirstLetter(id),
      chain: Array.from(meta.chains),
      marketType: meta.marketType,
    }));

    return filterAndSortMarkets(base, selectedChainKeys);
  }, [byChain, selectedChainKeys]);

  const marketOptions = useMemo(() => marketOptionsEnriched.map(toOptionDto), [marketOptionsEnriched]);

  const { selectedOptions: selectedMarketOptions, setSelectedOptions: setSelectedMarketOptions } = useOptions(
    marketOptions,
    selectedMarketKeys,
    setSelectedMarketKeys,
  );

  const byChainAndMarket = useMemo(
    () =>
      !selectedMarketOptions.length
        ? byChain
        : byChain.filter((d) => selectedMarketOptions.some((o) => o.value === (d.source.market ?? NOT_MARKET))),
    [byChain, selectedMarketOptions],
  );

  const assetTypesOptions = useMemo(
    () =>
      [...new Set(byChainAndMarket.map((d) => d.source.asset.type))]
        .sort()
        .map((value) => ({ label: capitalizeFirstLetter(value), value })),
    [byChainAndMarket],
  );

  const { selectedOptions: selectedAssetTypeOptions, setSelectedOptions: setSelectedAssetTypeOptions } = useOptions(
    assetTypesOptions,
    selectedAssetTypesKeys,
    setSelectedAssetTypeKeys,
  );

  const byChainMarketAndAsset = useMemo(
    () =>
      !selectedAssetTypeOptions.length
        ? byChainAndMarket
        : byChainAndMarket.filter((d) => selectedAssetTypeOptions.some((o) => o.value === d.source.asset.type)),
    [byChainAndMarket, selectedAssetTypeOptions],
  );

  const reserveSymbolOptions = useMemo(
    () =>
      [...new Set(byChainMarketAndAsset.map((d) => d.source.asset.symbol))]
        .filter(Boolean)
        .sort()
        .map((value) => ({ label: capitalizeFirstLetter(value), value })),
    [byChainMarketAndAsset],
  );

  const { selectedOptions: selectedSymbolOptions, setSelectedOptions: setSelectedSymbolOptions } = useOptions(
    reserveSymbolOptions,
    selectedSymbolKeys,
    setSelectedSymbolKeys,
  );

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedAssetTypeOptions.length ||
    !!selectedSymbolOptions.length;

  const prevLens = useRef({
    chain: selectedChainKeys.length,
    market: selectedMarketKeys.length,
    symbol: selectedSymbolKeys.length,
    asset: selectedAssetTypesKeys.length,
  });

  useEffect(() => {
    const p = prevLens.current;
    const bump =
      (p.chain > 0 && selectedChainKeys.length === 0) ||
      (p.market > 0 && selectedMarketKeys.length === 0) ||
      (p.symbol > 0 && selectedSymbolKeys.length === 0) ||
      (p.asset > 0 && selectedAssetTypesKeys.length === 0);
    if (bump) setResetHiddenKey((k) => k + 1);
    prevLens.current = {
      chain: selectedChainKeys.length,
      market: selectedMarketKeys.length,
      symbol: selectedSymbolKeys.length,
      asset: selectedAssetTypesKeys.length,
    };
  }, [selectedChainKeys.length, selectedMarketKeys.length, selectedSymbolKeys.length, selectedAssetTypesKeys.length]);

  const { result } = useProcessor({
    array: sortedRaw,
    filters: [
      (v) => !selectedChainOptions.length || selectedChainOptions.some((o) => o.value === v.source.network),
      (v) =>
        !selectedMarketOptions.length || selectedMarketOptions.some((o) => o.value === (v.source.market ?? NOT_MARKET)),
      (v) => !selectedAssetTypeOptions.length || selectedAssetTypeOptions.some((o) => o.value === v.source.asset.type),
      (v) => !selectedSymbolOptions.length || selectedSymbolOptions.some((o) => o.value === v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => rangeEndMs === null || v.date * 1000 <= rangeEndMs,
    ],
    transformer: () => {
      const groupedByDate: Record<string, StackedChartData> = {};

      return (item: RevenueItem) => {
        const itemTime = item.date * 1000;
        const date = new Date(itemTime).toISOString().split('T')[0];

        let seriesKey: string;
        if (selectedGroupKey === 'none') {
          seriesKey = 'Total';
        } else if (selectedGroupKey === 'assetType') {
          seriesKey = item.source.asset.type;
        } else if (selectedGroupKey === 'chain') {
          seriesKey = item.source.network;
        } else {
          seriesKey = item.source.market ?? NOT_MARKET;
        }

        if (!groupedByDate[date]) {
          groupedByDate[date] = { date };
        }
        const row = groupedByDate[date];
        row[seriesKey] = (Number(row[seriesKey]) || 0) + item.value;

        return groupedByDate;
      };
    },
  });

  const chartData = useMemo(() => {
    if (!result) return [];
    return Object.values(result).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [result]);

  const {
    chartRef,
    seriesData,
    aggregatedData,
    aggregatedSeries,
    areAllSeriesHidden,
    hiddenItems,
    setHiddenItems,
    setAreAllSeriesHidden,
    toggleSeriesByName,
    onSelectAll,
    onDeselectAll,
  } = useCompoundChartBars({
    barSize,
    data: chartData,
  });

  const hasAggregatedData = aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0);

  const csvData = getSummarizedCsvData(aggregatedSeries);

  const hasData = chartData.length > 0;

  const noDataMessage = isAnyFiltersSelected ? 'No data for selected filters' : 'No data available';

  const groupByForChart = groupByChartLabel[selectedGroupKey] ?? 'Chain';

  const feeReceivedChartActions = (
    <ChartActions
      mobileChildren={
        <>
          <CSVDownloadButton data={csvData} filename={getCsvFileName('compound-fee-revenue-received')} />
          {seriesData.length > 1 ? (
            <ChartIconToggle
              active={areAllSeriesHidden}
              onIcon='eye'
              offIcon='eye-closed'
              ariaLabel='Toggle all series visibility'
              className={{
                container: 'flex items-center gap-1.5 bg-transparent p-0 !shadow-none h-[44px]',
                icon: 'h-[26px] w-[26px]',
                iconContainer: 'h-[26px] w-[26px]',
              }}
              onClick={() => (areAllSeriesHidden ? onSelectAll() : onDeselectAll())}
            >
              <Text size='14' weight='500'>
                {areAllSeriesHidden ? 'Select All' : 'Unselect All'}
              </Text>
            </ChartIconToggle>
          ) : null}
        </>
      }
    >
      <CSVDownloadButton data={csvData} filename={getCsvFileName('compound-fee-revenue-received')} />
    </ChartActions>
  );

  return (
    <Card
      title='Compound Fee Revenue Received'
      id='compound-fee-revenue-received'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 pt-0 pb-0 px-5 lg:px-10 lg:pb-10',
      }}
    >
      <div className={'flex sm:flex-row sm:items-center flex-col-reverse gap-2 py-3 justify-end'}>
        <div className='flex w-full min-w-0 items-center gap-2 sm:w-auto'>
          <div className='min-w-0 flex-1 sm:w-full'>
            <TabsGroup
              className={{
                container: 'w-full sm:w-auto',
                list: 'w-full sm:w-auto',
              }}
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
              disabledTabs={disabledBarSizes}
            />
          </div>
          <div className='hidden shrink-0 sm:block'>{feeReceivedChartActions}</div>
        </div>
        <div className={'flex w-full sm:w-auto justify-end gap-2'}>
          <Filters onClearAll={clearAllFilters} isShowClear={isAnyFiltersSelected}>
            <DateRangePickerFilter
              triggerLabel='Date Range'
              value={{ startDate, endDate }}
              onChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
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
          <GroupFilter
            options={groupByOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            value={selectedGroupOption}
            setValue={({ value }) => setSelectedGroupKey(value)}
          />
          <div className='hidden shrink-0 sm:block'>{feeReceivedChartActions}</div>
        </div>
      </div>
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} text={noDataMessage} />
      ) : (
        <CompoundFeeRecievedChart
          customTooltipFormatter={customTooltipFormatter}
          customOptions={customChartOptions}
          chartRef={chartRef}
          resetHiddenKey={resetHiddenKey}
          hiddenItems={hiddenItems}
          areAllSeriesHidden={areAllSeriesHidden}
          groupBy={groupByForChart}
          barSize={barSize}
          seriesData={seriesData}
          aggregatedData={aggregatedData}
          toggleSeriesByName={toggleSeriesByName}
          onHiddenItems={setHiddenItems}
          onAreAllSeriesHidden={setAreAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
      )}
    </Card>
  );
};

export default CompoundFeeRevenueRecieved;
