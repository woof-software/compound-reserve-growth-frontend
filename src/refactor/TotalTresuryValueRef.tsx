import { useOptions } from '@/refactor/hooks/useOptions'
import { useUrlSyncDateRange } from '@/refactor/hooks/useUrlSyncDateRange'
import { useUrlSyncStingsArray } from '@/refactor/hooks/useUrlSyncStingsArray'
import { useUrlSyncString } from '@/refactor/hooks/useUrlSyncString'
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
import { useProcessor } from '@/refactor/hooks/useProcessor';
import { ChartActions } from '@/refactor/shared/ChartActions';
import { capitalize, dataValuesToOptions, matchesFilter } from '@/refactor/shared/utils';
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

  const groupByOptions = [
    {label: 'None', value: 'none'},
    {label: 'Asset Type', value: 'assetType'},
    {label: 'Chain', value: 'chain'},
    {label: 'Market', value: 'deployment'}
  ];

  const [[startDate, endDate], setDateRange] = useUrlSyncDateRange('ttv-date', [null, null])

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange({startDate, endDate});

  const [selectedChainKeys, setSelectedChainKeys] = useUrlSyncStingsArray('ttv-chain', []);
  const chainOptions = useMemo(() => (
    dataValuesToOptions(treasuryApiResponse.map(d => d.source.network))
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


  const [selectedMarketKeys, setSelectedMarketKeys] = useUrlSyncStingsArray('ttv-market', []);
  const marketOptions = useMemo(() => (
    dataValuesToOptions(byChain.map(d => d.source.market ?? NOT_MARKET))
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

  const [selectedAssetTypesKeys, setSelectedAssetTypesKeys] = useUrlSyncStingsArray('ttv-asset-type', []);
  const assetTypesOptions = useMemo(() => (
    dataValuesToOptions(byChainAndMarket.map(d => d.source.asset.type))
  ), [byChainAndMarket]);

  const {
    selectedOptions: selectedAssetTypeOptions,
    setSelectedOptions: setSelectedAssetTypeOptions,
  } = useOptions(assetTypesOptions, selectedAssetTypesKeys, setSelectedAssetTypesKeys);

  const byChainMarketAndAsset = useMemo(() => (
    !selectedAssetTypeOptions.length
      ? byChainAndMarket
      : byChainAndMarket.filter(d => selectedAssetTypeOptions.some(o => o.value === d.source.asset.type))
  ), [byChainAndMarket, selectedAssetTypeOptions]);

  const [selectedSymbolKeys, setSelectedSymbolKeys] = useUrlSyncStingsArray('ttv-symbol', []);
  const reserveSymbolOptions = useMemo(() => (
    dataValuesToOptions(byChainMarketAndAsset.map(d => d.source.asset.symbol))
  ), [byChainMarketAndAsset]);

  const {
    selectedOptions: selectedSymbolOptions,
    setSelectedOptions: setSelectedSymbolOptions,
  } = useOptions(reserveSymbolOptions, selectedSymbolKeys, setSelectedSymbolKeys);
  
  const [selectedGroupKey, setSelectedGroupKey] = useUrlSyncString('ttv-group', 'none');
  
  const selectedGroupOption = useMemo(() => {
    const selectedElement = groupByOptions.find(({ value }) => value === selectedGroupKey);
    
    if (!selectedElement) throw new Error('Selected group option not found');
    
    return selectedElement;
  }, [groupByOptions, selectedGroupKey]);

  const filterKeys = ['ttv-chain', 'ttv-market', 'ttv-asset-type', 'ttv-symbol', 'ttv-date'];

  const onClearAll = () => {
    setSelectedAssetTypesKeys([]);
    setSelectedMarketKeys([])
    setSelectedChainKeys([])
    setSelectedSymbolKeys([]);
    setDateRange([null, null]);
  };

  const { result } = useProcessor({
    array: treasuryApiResponse,
    filters: [
      (v) => v.value > 0,
      matchesFilter(selectedChainOptions, v => v.source.network),
      matchesFilter(selectedMarketOptions, v => v.source.market ?? NOT_MARKET),
      matchesFilter(selectedAssetTypeOptions, v => v.source.asset.type),
      matchesFilter(selectedSymbolOptions, v => v.source.asset.symbol),
      (v) => startDate === null || v.date * 1000 >= startDate,
      (v) => endDate === null || v.date * 1000 <= endDate,
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
              value={{startDate, endDate}}
              onChange={({ startDate, endDate }) => setDateRange([startDate, endDate])}
            />
            <DropdownFilter
              triggerLabel={'Chain'}
              options={chainOptions}
              selectedOptions={selectedChainOptions}
              onSelect={setSelectedChainOptions}
            />
            <DropdownFilter
              triggerLabel={'Market'}
              options={marketOptions}
              selectedOptions={selectedMarketOptions}
              onSelect={setSelectedMarketOptions}
            />
            <DropdownFilter
              triggerLabel={'Asset Type'}
              options={assetTypesOptions}
              selectedOptions={selectedAssetTypeOptions}
              onSelect={setSelectedAssetTypeOptions}
            />
            <DropdownFilter
              triggerLabel={'Reserve Symbol'}
              options={reserveSymbolOptions}
              selectedOptions={selectedSymbolOptions}
              onSelect={setSelectedSymbolOptions}
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
