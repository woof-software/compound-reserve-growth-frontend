import { useMemo, useState } from 'react';
import { useQueryState } from 'nuqs';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { ChartActions } from '@/components/Charts/ChartActions';
import LineChart, { LineChartSeries } from '@/components/Charts/Line/Line';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter,
} from '@/entities/Revenue/CompoundCumulativeRevenue/customChartOptions';
import { lineChartSeriesToUtcDayCumulative } from '@/entities/Revenue/CompoundCumulativeRevenue/useCumulativeChartSeries';
import { type RevenueProps } from '@/pages/AccountingPage/AccountingPage';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { useEventsApi } from '@/shared/hooks/useEventsApi';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { getEndOfDayTimestamp } from '@/shared/lib/date/dateUtils';
import { filterForRange } from '@/shared/lib/utils/chart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
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

type MetaMarket = {
  chains: Set<string>;
  marketType: string;
};

const toOptionDto = (o: OptionType) => ({ label: o.label, value: o.id });

const CompoundCumulativeRevenue = ({ revenueData, isLoading, isError }: RevenueProps) => {
  const { data: events } = useEventsApi();

  const [isShowEvents, setIsShowEvents] = useState<boolean>(true);

  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('ccr-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('ccr-market', parseStingsArray([]));
  const [selectedAssetTypesKeys, setSelectedAssetTypeKeys] = useQueryState('ccr-asset-type', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('ccr-symbol', parseStingsArray([]));
  const [startDate, setStartDate] = useQueryState('ccr-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('ccr-end', parseAsTimestampMs);

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setSelectedAssetTypeKeys([]);
    setSelectedSymbolKeys([]);
    setStartDate(null);
    setEndDate(null);
  };

  const rangeEndMs = useMemo(() => (endDate === null ? null : getEndOfDayTimestamp(endDate)), [endDate]);

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange({
    startDate,
    endDate,
  });

  const rawData = useMemo(() => [...revenueData].sort((a, b) => a.date - b.date), [revenueData]);

  const chainOptions = useMemo(
    () =>
      [...new Set(rawData.map((d) => d.source.network))]
        .sort()
        .map((value) => ({ label: capitalizeFirstLetter(value), value })),
    [rawData],
  );

  const { selectedOptions: selectedChainOptions, setSelectedOptions: setSelectedChainOptions } = useOptions(
    chainOptions,
    selectedChainKeys,
    setSelectedChainKeys,
  );

  const selectedChainOptionsSet = useMemo(
    () => new Set(selectedChainOptions.map(o => o.value)),
    [selectedChainOptions]
  );

  const byChain = useMemo(
    () =>
      !selectedChainOptions.length
        ? rawData
        : rawData.filter((d) => selectedChainOptionsSet.has(d.source.network)),
    [rawData, selectedChainOptions],
  );

  const marketOptionsEnriched = useMemo(() => {
    const metaByMarket = new Map<string, MetaMarket>();

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

  const selectedMarketOptionsSet = useMemo(
    () => new Set(selectedMarketOptions.map(o => o.value)),
    [selectedMarketOptions]
  );

  const byChainAndMarket = useMemo(
    () =>
      !selectedMarketOptions.length
        ? byChain
        : byChain.filter((d) => selectedMarketOptionsSet.has(d.source.market ?? NOT_MARKET)),
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

  const selectedAssetTypeOptionsSet = useMemo(
    () => new Set(selectedAssetTypeOptions.map(o => o.value)),
    [selectedAssetTypeOptions]
  );

  const byChainMarketAndAsset = useMemo(
    () =>
      !selectedAssetTypeOptions.length
        ? byChainAndMarket
        : byChainAndMarket.filter((d) => selectedAssetTypeOptionsSet.has(d.source.asset.type)),
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

  const selectedSymbolOptionsSet = useMemo(
    () => new Set(selectedSymbolOptions.map(o => o.value)),
    [selectedSymbolOptions]
  );

  const chartGroupBy = useMemo(() => {
    if (selectedMarketOptions.length > 0) return 'market' as const;
    if (selectedChainOptions.length > 0) return 'network' as const;
    return 'none' as const;
  }, [selectedChainOptions.length, selectedMarketOptions.length]);

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedAssetTypeOptions.length ||
    !!selectedSymbolOptions.length;

  const { result } = useProcessor({
    array: rawData,
    filters: [
      (v) => !selectedChainOptions.length || selectedChainOptionsSet.has(v.source.network),
      (v) => !selectedMarketOptions.length || selectedMarketOptionsSet.has(v.source.market ?? NOT_MARKET),
      (v) => !selectedAssetTypeOptions.length || selectedAssetTypeOptionsSet.has(v.source.asset.type),
      (v) => !selectedSymbolOptions.length || selectedSymbolOptionsSet.has(v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => rangeEndMs === null || v.date * 1000 <= rangeEndMs,
    ],
    transformer: () => {
      const seriesMap: Record<string, Map<number, number>> = {};

      return (v) => {
        const key =
          chartGroupBy === 'none'
            ? 'Daily Revenue'
            : chartGroupBy === 'market'
              ? (v.source.market ?? NOT_MARKET)
              : v.source.network;

        if (!seriesMap[key]) seriesMap[key] = new Map<number, number>();

        const dateKey = v.date * 1000;
        const current = seriesMap[key].get(dateKey) ?? 0;
        seriesMap[key].set(dateKey, current + v.value);

        return seriesMap;
      };
    },
  });

  const dailyChartSeries: LineChartSeries[] = useMemo(() => {
    if (!result) return [];

    return Object.entries(result).map(([name, dateMap]) => ({
      name: capitalizeFirstLetter(name),
      data: Array.from(dateMap.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x),
    }));
  }, [result]);

  const cumulativeChartSeries = useMemo(
    () => lineChartSeriesToUtcDayCumulative(dailyChartSeries),
    [dailyChartSeries]
  );

  const { isLegendEnabled, aggregatedSeries } = useLineChart({
    data: cumulativeChartSeries,
    groupBy: chartGroupBy,
    barSize,
  });

  const hasAggregatedData = aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0);

  const {
    legends,
    toggle: onLegendToggle,
    activateAll: onSelectAllLegends,
    deactivateAll: onDeselectAllLegends,
    highlight: onLegendHover,
    unhighlight: onLegendUnhover,
  } = useLegends(aggregatedSeries, ({ name, color }) => ({
    id: `${name}`,
    name: `${name}`,
    isDisabled: false,
    isHighlighted: false,
    color: `${color}`,
  }));

  const isSeriesHidden = legends.every((l) => l.isDisabled);

  const hasData = cumulativeChartSeries.length > 0 && cumulativeChartSeries.some((s) => s.data.length > 0);

  const noDataMessage = isAnyFiltersSelected ? 'No data for selected filters' : 'No data available';

  const getGroupByForChart = () => {
    if (chartGroupBy === 'none') return 'none';
    return chartGroupBy === 'market' ? 'Market' : 'Chain';
  };

  return (
    <Card
      title='Compound Cumulative Revenue'
      id='compound-cumulative-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 pt-0 pb-0 px-5 lg:px-10 lg:pb-10',
      }}
    >
      <div className={'flex sm:flex-row sm:items-center flex-col-reverse gap-2 py-3 justify-end'}>
        <div className={'w-full sm:w-auto'}>
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
              triggerLabel='Asset Type'
              options={assetTypesOptions}
              selectedOptions={selectedAssetTypeOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedAssetTypeOptions}
            />
            <DropdownFilter
              triggerLabel='Reserve Symbol'
              options={reserveSymbolOptions}
              selectedOptions={selectedSymbolOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedSymbolOptions}
            />
          </Filters>
          <ChartActions
            mobileChildren={
              <>
                <CSVDownloadButton data={() => filterForRange({
                  data: cumulativeChartSeries[0]?.data ?? [],
                  getDate: (item) => new Date(item.x),
                  transform: (item) => ({
                    Date: new Date(item.x).toISOString().split('T')[0],
                    'Cumulative revenue': item.y,
                  }),
                  range: barSize,
                })} filename={getCsvFileName('compound_cumulative_revenue')} />
                {isLegendEnabled && aggregatedSeries.length > 1 ? (
                  <ChartIconToggle
                    active={isSeriesHidden}
                    onIcon='eye'
                    offIcon='eye-closed'
                    ariaLabel='Toggle all series visibility'
                    className={{
                      container: 'flex items-center gap-1.5 bg-transparent p-0 !shadow-none h-[44px]',
                      icon: 'h-[26px] w-[26px]',
                      iconContainer: 'h-[26px] w-[26px]',
                    }}
                    onClick={() => (isSeriesHidden ? onSelectAllLegends() : onDeselectAllLegends())}
                  >
                    <Text size='14' weight='500'>
                      {isSeriesHidden ? 'Select All' : 'Unselect All'}
                    </Text>
                  </ChartIconToggle>
                ) : null}
                {events?.length ? (
                  <ChartIconToggle
                    active={!isShowEvents}
                    onIcon='calendar-check'
                    offIcon='calendar-uncheck'
                    ariaLabel='Toggle events'
                    className={{
                      container: 'flex items-center gap-1.5 bg-transparent p-0 !shadow-none h-[44px]',
                      icon: 'h-[26px] w-[26px]',
                      iconContainer: 'h-[26px] w-[26px]',
                    }}
                    onClick={() => setIsShowEvents((prev) => !prev)}
                  >
                    <Text size='14' weight='500'>
                      Hide Events
                    </Text>
                  </ChartIconToggle>
                ) : null}
              </>
            }
          >
            <CSVDownloadButton data={() => filterForRange({
              data: cumulativeChartSeries[0]?.data ?? [],
              getDate: (item) => new Date(item.x),
              transform: (item) => ({
                Date: new Date(item.x).toISOString().split('T')[0],
                'Cumulative revenue': item.y,
              }),
              range: barSize,
            })} filename={getCsvFileName('compound_cumulative_revenue')} />
          </ChartActions>
        </div>
      </div>
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} text={noDataMessage} />
      ) : (
        <LineChart
          className='max-h-fit'
          groupBy={getGroupByForChart()}
          aggregatedSeries={aggregatedSeries}
          isLegendEnabled={isLegendEnabled}
          events={events}
          showEvents={isShowEvents}
          customOptions={customChartOptions}
          customTooltipFormatter={customTooltipFormatter}
          resetZoomKey={`${barSize}-${startDate}-${endDate}`}
          legends={legends}
          onSelectAllLegends={onSelectAllLegends}
          onDeselectAllLegends={onDeselectAllLegends}
          onShowEvents={setIsShowEvents}
          onLegendHover={onLegendHover}
          onLegendLeave={onLegendUnhover}
          onLegendClick={onLegendToggle}
        />
      )}
    </Card>
  );
};

export default CompoundCumulativeRevenue;
