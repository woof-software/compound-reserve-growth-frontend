import React, { useMemo, useState } from 'react';
import { useQueryState } from 'nuqs';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { ChartActions } from '@/components/Charts/ChartActions';
import LineChart, { LineChartSeries } from '@/components/Charts/Line/Line';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import { GroupFilter } from '@/components/Filter/GroupFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Treasury/TotalTreasuryValue/customChartOptions';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { useEventsApi } from '@/shared/hooks/useEventsApi';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { filterForRange } from '@/shared/lib/utils/chart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { capitalizeFirstLetter, parseAsTimestampMs, parseStingsArray } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface TotalTreasuryValueProps {
  data: TokenData[];
  isLoading: boolean;
  isError: boolean;
  onCopyLink?: (id: string) => void;
}

const TotalTreasuryValue = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: TotalTreasuryValueProps) => {

  const {data: events} = useEventsApi();

  const [isShowEvents, setIsShowEvents] = useState<boolean>(true);

  const groupByOptions = useMemo(() => [
    {label: 'None', value: 'none'},
    {label: 'Asset Type', value: 'assetType'},
    {label: 'Chain', value: 'chain'},
    {label: 'Market', value: 'deployment'}
  ], []);

  const [selectedGroupKey, setSelectedGroupKey] = useQueryState('ttv-group', { defaultValue: 'none' });
  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('ttv-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('ttv-market', parseStingsArray([]));
  const [selectedAssetTypesKeys, setSelectedAssetTypeKeys] = useQueryState('ttv-asset-type', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('ttv-symbol', parseStingsArray([]));
  const [startDate, setStartDate] = useQueryState('ttv-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('ttv-end', parseAsTimestampMs);
  
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
    [...new Set(treasuryApiResponse.map(d => d.source.network))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [treasuryApiResponse]);

  const {
    selectedOptions: selectedChainOptions,
    setSelectedOptions: setSelectedChainOptions,
  } = useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const byChain = useMemo(() => (
    !selectedChainOptions.length
      ? treasuryApiResponse
      : treasuryApiResponse.filter(d => selectedChainOptions.some(o => o.value === d.source.network))
  ), [treasuryApiResponse, selectedChainOptions]);

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

  const selectedGroupOption = useMemo(() => {
    const selectedElement = groupByOptions.find(({value}) => value === selectedGroupKey);

    if (!selectedElement) throw new Error('Selected group option not found');

    return selectedElement;
  }, [groupByOptions, selectedGroupKey]);

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length ||
    !!selectedAssetTypeOptions.length ||
    !!selectedSymbolOptions.length;

  const {result} = useProcessor({
    array: treasuryApiResponse,
    filters: [
      (v) => v.value > 0,
      (v) => !selectedChainOptions.length || selectedChainOptions.some(o => o.value === v.source.network),
      (v) => !selectedMarketOptions.length || selectedMarketOptions.some(o => o.value === (v.source.market ?? NOT_MARKET)),
      (v) => !selectedAssetTypeOptions.length || selectedAssetTypeOptions.some(o => o.value === v.source.asset.type),
      (v) => !selectedSymbolOptions.length || selectedSymbolOptions.some(o => o.value === v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => endDate === null || v.date * 1000 <= endDate,
    ],
    transformer: () => {
      const seriesMap: Record<string, Map<number, number>> = {};

      return (v) => {
        const key = {
            chain: v.source.network,
            assetType: v.source.asset.type,
            deployment: v.source.market ?? NOT_MARKET,
          }[selectedGroupKey] ?? 'Treasury Value';

        if (!seriesMap[key]) seriesMap[key] = new Map<number, number>();

        const dateKey = v.date * 1000;
        const current = seriesMap[key].get(dateKey) ?? 0;
        seriesMap[key].set(dateKey, current + v.value);

        return seriesMap;
      };
    }
  });

  const chartSeries: LineChartSeries[] = useMemo(() => {
    if (!result) return [];

    return Object.entries(result).map(([name, dateMap]) => ({
      name: capitalizeFirstLetter(name),
      data: Array.from(dateMap.entries())
        .map(([x, y]) => ({x, y}))
        .sort((a, b) => a.x - b.x)
    }));
  }, [result]);

  const {isLegendEnabled, aggregatedSeries} = useLineChart({
    data: chartSeries,
    groupBy: selectedGroupKey,
    barSize
  });

  const hasAggregatedData = chartSeries[0]?.data.length > 0;

  const {
    legends,
    toggle: onLegendToggle,
    activateAll: onSelectAllLegends,
    deactivateAll: onDeselectAllLegends,
    highlight: onLegendHover,
    unhighlight: onLegendUnhover
  } = useLegends(aggregatedSeries, ({name, color}) => ({
    id: `${name}`,
    name: `${name}`,
    isDisabled: false,
    isHighlighted: false,
    color: `${color}`
  }));

  const csvData = useMemo(() => {
    if (!result) return [];

    const isSingleSeries = selectedGroupKey === 'none';

    const dateMap = Object.entries(result).reduce<Record<number, Record<string, number | string>>>(
      (acc, [name, valueMap]) => {
        const columnName = isSingleSeries ? 'Total treasury' : capitalizeFirstLetter(name);
        valueMap.forEach((value, timestamp) => {
          acc[timestamp] = {
            ...acc[timestamp],
            Date: new Date(timestamp).toISOString().split('T')[0],
            [columnName]: value,
          };
        });
        return acc;
      },
      {}
    );

    return filterForRange({
      data: Object.entries(dateMap).map(([x, row]) => ({ x: Number(x), row })),
      getDate: ({ x }) => new Date(x),
      transform: ({ row }) => row,
      range: barSize,
    });
  }, [result, selectedGroupKey, barSize]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Total Treasury Value'
      id='total-treasury-value'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 pt-0 pb-0 px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className={'flex sm:flex-row sm:items-center flex-col-reverse gap-2 py-3 justify-end'}>
        <div className={'w-full sm:w-auto'}>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
        </div>
        <div className={'flex w-full sm:w-auto justify-end gap-2'}>
          <Filters
            onClearAll={clearAllFilters}
            isShowClear={isAnyFiltersSelected}
          >
            <DateRangePickerFilter
              triggerLabel='Date Range'
              value={{startDate, endDate}}
              onChange={({startDate, endDate}) => {
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
            setValue={({value}) => setSelectedGroupKey(value)}
          />
          <ChartActions
            mobileChildren={
              <>
                <CSVDownloadButton
                  data={csvData}
                  filename={getCsvFileName('total_treasury_value')}
                />
                <ChartIconToggle
                  active={!isShowEvents}
                  onIcon='calendar-check'
                  offIcon='calendar-uncheck'
                  ariaLabel='Toggle events'
                  className={{
                    container:
                      'flex items-center gap-1.5 bg-transparent p-0 !shadow-none h-[44px]',
                    icon: 'h-[26px] w-[26px]',
                    iconContainer: 'h-[26px] w-[26px]'
                  }}
                  onClick={() => setIsShowEvents(prev => !prev)}
                >
                  <Text size='14' weight='500'>
                    Hide Events
                  </Text>
                </ChartIconToggle>
              </>
            }
          >
            <CSVDownloadButton
              data={csvData}
              filename={getCsvFileName('total_treasury_value')}
            />
          </ChartActions>
        </div>
      </div>
      {!isLoading && !isError && !hasAggregatedData ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters}/>
      ) : (
        <LineChart
          customOptions={customChartOptions}
          customTooltipFormatter={customTooltipFormatter}
          key={selectedGroupKey}
          groupBy={selectedGroupKey}
          legends={legends}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          isLegendEnabled={isLegendEnabled}
          resetZoomKey={`${barSize}-${startDate}-${endDate}`}
          events={events}
          showEvents={isShowEvents}
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

export default TotalTreasuryValue;
