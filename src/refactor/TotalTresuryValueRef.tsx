import {useUrlSync} from "@/refactor/hooks/useUrlFilterSync";
import React, { useMemo, useState } from 'react';

import LineChart, { LineChartSeries } from '@/components/Charts/Line/Line';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Treasury/TotalTreasuryValue/customChartOptions';
import { DateRangePickerFilter } from '@/refactor/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/refactor/DropdownFilter/DropdownFilter';
import { FiltersProvider } from '@/refactor/filters/FiltersProvider';
import { GroupFilter } from '@/refactor/filters/GroupFilter';
import { useBarSizeWithDateRange } from '@/refactor/hooks/useBarSizeWithDateRange';
import { useFilterOptions } from '@/refactor/hooks/useFilterOptions';
import { useGetFilterOptions } from '@/refactor/hooks/useGetFilterOptions';
import { useProcessor } from '@/refactor/hooks/useProcessor';
import { ChartActions } from '@/refactor/shared/ChartActions';
import { capitalize,  matchesFilter } from '@/refactor/shared/utils';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useEventsApi } from '@/shared/hooks/useEventsApi';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { filterForRange } from '@/shared/lib/utils/chart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

import { Filters } from './filters/Filters';

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

  const { data: events } = useEventsApi();

  const [isShowEvents, setIsShowEvents] = useState<boolean>(true);

  const [chainOptions, marketOptions, assetTypeOptions, symbolOptions] = useGetFilterOptions({
    rawData: treasuryApiResponse,
    levels: [
      { key: 'ttv-chain', getValue: d => d.source.network },
      { key: 'ttv-market', getValue: d => d.source.market || '' },
      { key: 'ttv-asset-type', getValue: d => d.source.asset.type },
      { key: 'ttv-symbol', getValue: d => d.source.asset.symbol },
    ]
  });

  const groupByOptions = [
    {label: 'None', value: 'none'},
    {label: 'Asset Type', value: 'assetType'},
    {label: 'Chain', value: 'chain'},
    {label: 'Market', value: 'deployment'}
  ];

  const [startDate, setStartDate] = useUrlSync('ttv-date-s', null as number | null);
  const [endDate, setEndDate] = useUrlSync('ttv-date-e', null as number | null);
  
  const dateRange = useMemo(() => {
    return {
      startDate,
      endDate,
    };
  }, [startDate, endDate]);

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange(dateRange);

  const [
    selectedChainOptions,
    setSelectedChainOptions,
    setAllChainOptions,
    clearAllChainOptions
  ] = useFilterOptions('ttv-chain', chainOptions, 'multi');

  const [
    selectedMarketOptions,
    setSelectedMarketOptions,
    setAllMarketOptions,
    clearAllMarketOptions
  ] = useFilterOptions('ttv-market', marketOptions, 'multi');

  const [
    selectedAssetTypeOptions,
    setSelectedAssetTypeOptions,
    setAllAssetTypeOptions,
    clearAllAssetTypeOptions
  ] = useFilterOptions('ttv-asset-type', assetTypeOptions, 'multi');

  const [selectedSymbolKeys, setSelectedSymbolKeys] = useUrlSync<string[]>('ttv-symbol', []);
  
  const selectedSymbolOptions = useMemo(() => {
    return symbolOptions.filter(({ value }) => selectedSymbolKeys.includes(value));
  }, [selectedSymbolKeys, symbolOptions]);
  
  const [selectedGroupKey, setSelectedGroupKey] = useUrlSync('ttv-group', 'none');
  
  const selectedGroupOption = useMemo(() => {
    const selectedElement = groupByOptions.find(({ value }) => value === selectedGroupKey);
    
    if (!selectedElement) throw new Error('Selected group option not found');
    
    return selectedElement;
  }, [groupByOptions, selectedGroupKey]);

  const filterKeys = ['ttv-chain', 'ttv-market', 'ttv-asset-type', 'ttv-symbol', 'ttv-date'];

  const onClearAll = () => {
    clearAllChainOptions();
    clearAllMarketOptions();
    clearAllAssetTypeOptions();
    setSelectedSymbolKeys([]);
    setStartDate(0);
    setEndDate(0);
  };

  const { result } = useProcessor({
    array: treasuryApiResponse ?? [],
    filters: [
      (v) => v.value > 0,
      matchesFilter(selectedChainOptions, v => v.source.network),
      matchesFilter(selectedMarketOptions, v => v.source.market ?? NOT_MARKET),
      matchesFilter(selectedAssetTypeOptions, v => v.source.asset.type),
      matchesFilter(selectedSymbolOptions, v => v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => endDate   === null || v.date * 1000 <= endDate,
    ],
    transformer: () => {
      const seriesMap: Record<string, Map<number, number>> = {};

      const getKey = (v: any): string => {
        switch (selectedGroupKey) {
          case 'chain': return v.source.network;
          case 'assetType':  return v.source.asset.type;
          case 'deployment': return v.source.market ?? NOT_MARKET;
          default: return 'Treasury Value';
        }
      };

      return (v) => {
        const key = getKey(v);
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
      name: capitalize(name),
      data: Array.from(dateMap.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x)
    }));
  }, [result]);

  const { isLegendEnabled, aggregatedSeries } = useLineChart({
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
  } = useLegends(aggregatedSeries, ({ name, color }) => ({
    id: `${name}`,
    name: `${name}`,
    isDisabled: false,
    isHighlighted: false,
    color: `${color}`
  }));

  const csvData = filterForRange({
    data: chartSeries[0]?.data ?? [],
    getDate: (item) => new Date(item.x),
    transform: (item) => ({
      Date: new Date(item.x).toISOString().split('T')[0],
      'Total treasury': item.y
    }),
    range: barSize
  });

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
      <div className={'flex items-center gap-2 py-3 justify-end flex-wrap'}>
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
        <FiltersProvider filterKeys={filterKeys}>
          <Filters>
            <DateRangePickerFilter
              triggerLabel='Date Range'
              value={dateRange}
              onChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
            <DropdownFilter
              triggerLabel={'Chain'}
              options={chainOptions}
              selectedOptions={selectedChainOptions}
              setSelectedOptions={setSelectedChainOptions}
              clearAll={clearAllChainOptions}
              setAll={setAllChainOptions}
            />
            <DropdownFilter
              triggerLabel={'Market'}
              options={marketOptions}
              selectedOptions={selectedMarketOptions}
              setSelectedOptions={setSelectedMarketOptions}
              clearAll={clearAllMarketOptions}
              setAll={setAllMarketOptions}
            />
            <DropdownFilter
              triggerLabel={'Asset Type'}
              options={assetTypeOptions}
              selectedOptions={selectedAssetTypeOptions}
              setSelectedOptions={setSelectedAssetTypeOptions}
              clearAll={clearAllAssetTypeOptions}
              setAll={setAllAssetTypeOptions}
            />
            <DropdownFilter
              triggerLabel={'Reserve Symbol'}
              options={symbolOptions}
              selectedOptions={selectedSymbolOptions}
              setSelectedOptions={(v) => {
                const values = new Set(selectedSymbolKeys);
                
                if (values.has(v.value)) {
                  values.delete(v.value);
                } else {
                  values.add(v.value);
                }
                
                setSelectedSymbolKeys([...values]);
              }}
              clearAll={() => setSelectedSymbolKeys([])}
              setAll={() => setSelectedSymbolKeys(symbolOptions.map(({ value }) => value))}
            />
          </Filters>
          <GroupFilter
            options={groupByOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            value={selectedGroupOption}
            setValue={({ value }) => setSelectedGroupKey(value)}
          />
          <ChartActions
            isShowEvents={isShowEvents}
            setIsShowEvents={setIsShowEvents}
          >
            <CSVDownloadButton
              data={csvData}
              filename={getCsvFileName('total_treasury_value')}
            />
          </ChartActions>
        </FiltersProvider>
      </div>
      {!isLoading && !isError && !hasAggregatedData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
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
          resetZoomKey={`${barSize}-${dateRange.startDate}-${dateRange.endDate}`}
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
