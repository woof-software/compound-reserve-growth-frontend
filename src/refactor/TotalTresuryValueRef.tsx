import { DateRangePickerFilter } from '@/refactor/DateRangePickerFilter/DateRangePickerFilter'
import { DropdownFilter } from '@/refactor/DropdownFilter/DropdownFilter'
import { DropdownFilterActions } from '@/refactor/DropdownFilter/DropdownFilterActions'
import { DropdownFilterInput } from '@/refactor/DropdownFilter/DropdownFilterInput'
import { DropdownFilterTrigger } from '@/refactor/DropdownFilter/DropdownFilterTrigger'
import { DropdownGroupFilterTrigger } from '@/refactor/DropdownFilter/DropdownGroupFilterTrigger'
import { FiltersProvider } from '@/refactor/filters/FiltersProvider'
import { GroupFilter } from '@/refactor/filters/GroupFilter'
import { useDateRangeFilterOptions } from '@/refactor/hooks/useDateRangeFilterOptions'
import { useFilterOptions } from '@/refactor/hooks/useFilterOptions'
import { useUrlFilterSync } from '@/refactor/hooks/useUrlFilterSync'
import { capitalize, dataValuesToOptions } from '@/refactor/shared/utils'
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { CSVLink } from 'react-csv';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import GroupDrawer from '@/components/GroupDrawer/GroupDrawer';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Treasury/TotalTreasuryValue/customChartOptions';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useDateRangeFilter } from '@/shared/hooks/useDataRangeFilter';
import { useEventsApi } from '@/shared/hooks/useEventsApi';
import {
  useFiltersSync
} from '@/shared/hooks/useFiltersSync';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useModal } from '@/shared/hooks/useModal';
import { getMaxBarSizeForRange } from '@/shared/lib/date/dateUtils';
import { filterForRange } from '@/shared/lib/utils/chart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import {
  ChartDataItem,
  extractFilterOptions,
  filterAndSortMarkets,
  groupOptionsDto
} from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { BAR_SIZE, BAR_SIZE_OPTIONS, OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import { DateRangePickerPopover } from '@/shared/ui/DateRangePicker/DateRangePicker';
import { DateRangeValue } from '@/shared/ui/DateRangePicker/types';
import Drawer from '@/shared/ui/Drawer/Drawer';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import SingleDropdown from '@/shared/ui/SingleDropdown/SingleDropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';
import { Filters } from './filters/Filters'

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

const BAR_SIZE_ORDER = {
  [BAR_SIZE.D]: 0,
  [BAR_SIZE.W]: 1,
  [BAR_SIZE.M]: 2
} as const;

const TotalTreasuryValue = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: TotalTreasuryValueProps) => {

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: BAR_SIZE.D
  });

  const {
    // dateRange,
    // setDateRange,
    normalizedDateRange,
    dateBounds,
    resetDateRange,
    mobileFilterOption: dateRangeMobileOption
  } = useDateRangeFilter();

  const maxSelectableBarSize = useMemo<BAR_SIZE>(() => {
    const { start, end } = normalizedDateRange;
    if (start === null || end === null) return BAR_SIZE.M;
    return getMaxBarSizeForRange(start, end);
  }, [normalizedDateRange]);

  const disabledBarSizes = useMemo<BAR_SIZE[]>(
    () =>
      BAR_SIZE_OPTIONS.filter(
        (size) => BAR_SIZE_ORDER[size] > BAR_SIZE_ORDER[maxSelectableBarSize]
      ),
    [maxSelectableBarSize]
  );

  useEffect(() => {
    const { start, end } = normalizedDateRange;
    if (start === null || end === null) return;

    const nextBarSize = getMaxBarSizeForRange(start, end);
    if (BAR_SIZE_ORDER[nextBarSize] < BAR_SIZE_ORDER[barSize]) {
      onBarSizeChange(nextBarSize);
    }
  }, [barSize, normalizedDateRange, onBarSizeChange]);

  const rawData: ChartDataItem[] = useMemo(() => {
    if (!treasuryApiResponse) {
      return [];
    }
    return [...treasuryApiResponse].sort((a, b) => a.date - b.date);
  }, [treasuryApiResponse]);

  // const { chartSeries } = useChartDataProcessor({
  //   rawData,
  //   filters: activeFilters,
  //   filterPaths: {
  //     chain: 'source.network',
  //     assetType: 'source.asset.type',
  //     deployment: 'source.market',
  //     symbol: 'source.asset.symbol'
  //   },
  //   groupBy,
  //   groupByKeyPath:
  //     groupBy === 'None'
  //       ? null
  //       : filterOptionsConfig[
  //         groupByMapping[groupBy] as keyof typeof filterOptionsConfig
  //         ].path,
  //   defaultSeriesName: 'Treasury Value',
  //   dateRange: normalizedDateRange
  // });

  // const correctedChartSeries = useMemo(() => {
  //   if (!chartSeries || chartSeries.length === 0) {
  //     return [];
  //   }
  //
  //   return chartSeries.map((series) => {
  //     if (!series.data || series.data.length === 0) {
  //       return series;
  //     }
  //
  //     const dailyTotals = new Map<number, number>();
  //
  //     for (const point of series.data) {
  //       const date = new Date(point.x);
  //       date.setUTCHours(0, 0, 0, 0);
  //       const dayStartTimestamp = date.getTime();
  //
  //       const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
  //       dailyTotals.set(dayStartTimestamp, currentTotal + point.y);
  //     }
  //
  //     const aggregatedData = Array.from(dailyTotals.entries()).map(
  //       ([x, y]) => ({
  //         x,
  //         y
  //       })
  //     );
  //
  //     aggregatedData.sort((a, b) => a.x - b.x);
  //
  //     return {
  //       ...series,
  //       data: aggregatedData
  //     };
  //   });
  // }, [chartSeries]);

  // const csvData = filterForRange({
  //   data: correctedChartSeries[0]?.data ?? [],
  //   getDate: (item) => new Date(item.x),
  //   transform: (item) => ({
  //     Date: new Date(item.x).toISOString().split('T')[0],
  //     'Total treasury': item.y
  //   }),
  //   range: barSize
  // });
  //
  // const hasData = useMemo(() => {
  //   return (
  //     correctedChartSeries.length > 0 &&
  //     correctedChartSeries.some((s) => s.data.length > 0)
  //   );
  // }, [correctedChartSeries]);
  //
  // const { isLegendEnabled, aggregatedSeries } = useLineChart({
  //   groupBy,
  //   data: correctedChartSeries,
  //   barSize
  // });

  // const hasAggregatedData = useMemo(
  //   () =>
  //     aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0),
  //   [aggregatedSeries]
  // );

  // const {
  //   legends,
  //   toggle: onLegendToggle,
  //   activateAll: onSelectAllLegends,
  //   deactivateAll: onDeselectAllLegends,
  //   highlight: onLegendHover,
  //   unhighlight: onLegendUnhover
  // } = useLegends(aggregatedSeries, ({ name, color }) => ({
  //   id: `${name}`,
  //   name: `${name}`,
  //   isDisabled: false,
  //   isHighlighted: false,
  //   color: `${color}`
  // }));

  // const isSeriesHidden = legends.every((l) => l.isDisabled);

  const { data: events } = useEventsApi();

  const [showEvents, setIsShowEvents] = useState<boolean>(true);

  const getFilterOptions = () => ({
    markets: dataValuesToOptions(rawData.map(d => d.source.market)),
    assetTypes: dataValuesToOptions(rawData.map(d => d.source.asset.type)),
    reserveSymbols: dataValuesToOptions(rawData.map(d => d.source.asset.symbol)),
    chains: dataValuesToOptions(rawData.map(d => d.source.network)),
  });

  const groupByOptions = [
    {label: 'None', value: 'none'},
    {label: 'Asset Type', value: 'assetType'},
    {label: 'Chain', value: 'chain'},
    {label: 'Market', value: 'deployment'}
  ];

  const [
    selectedChainOptions,
    setSelectedChainOptions,
    setAllChainOptions,
    clearAllChainOptions
  ] = useFilterOptions('ttv-chain', getFilterOptions().chains, 'multi');

  const [
    selectedMarketOptions,
    setSelectedMarketOptions,
    setAllMarketOptions,
    clearAllMarketOptions
  ] = useFilterOptions('ttv-market', getFilterOptions().markets, 'multi');

  const [
    selectedAssetTypeOptions,
    setSelectedAssetTypeOptions,
    setAllAssetTypeOptions,
    clearAllAssetTypeOptions
  ] = useFilterOptions('ttv-asset-type', getFilterOptions().assetTypes, 'multi');

  const [
    selectedSymbolOptions,
    setSelectedSymbolOptions,
    setAllSymbolOptions,
    clearAllSymbolOptions
  ] = useFilterOptions('ttv-symbol', getFilterOptions().reserveSymbols, 'multi');

  const [
    selectedGroupOptions,
    setSelectedGroupOptions
  ] = useFilterOptions('ttv-group', groupByOptions, 'single', 'none');

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Total Treasury Value'
      id='total-treasury-value'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className={'flex items-center gap-2 py-3'}>
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
        <FiltersProvider filterKeys={['ttv-chain', 'ttv-market', 'ttv-asset-type', 'ttv-symbol']}>
          <Filters>
            <DropdownFilter
              triggerLabel={'Chain'}
              options={getFilterOptions().chains}
              selectedOptions={selectedChainOptions}
              setSelectedOptions={setSelectedChainOptions}
              clearAll={clearAllChainOptions}
              setAll={setAllChainOptions}
            />
            <DropdownFilter
              triggerLabel={'Market'}
              options={getFilterOptions().markets}
              selectedOptions={selectedMarketOptions}
              setSelectedOptions={setSelectedMarketOptions}
              clearAll={clearAllMarketOptions}
              setAll={setAllMarketOptions}
            />
            <DropdownFilter
              triggerLabel={'Asset Type'}
              options={getFilterOptions().assetTypes}
              selectedOptions={selectedAssetTypeOptions}
              setSelectedOptions={setSelectedAssetTypeOptions}
              clearAll={clearAllAssetTypeOptions}
              setAll={setAllAssetTypeOptions}
            />
            <DropdownFilter
              triggerLabel={'Reserve Symbol'}
              options={getFilterOptions().reserveSymbols}
              selectedOptions={selectedSymbolOptions}
              setSelectedOptions={setSelectedSymbolOptions}
              clearAll={clearAllSymbolOptions}
              setAll={setAllSymbolOptions}
            />
          </Filters>
          <GroupFilter
            options={groupByOptions}
            selectedOptions={selectedGroupOptions}
            setSelectedOptions={setSelectedGroupOptions}
          />
        </FiltersProvider>
      </div>

      {/*{!isLoading && !isError && (!hasData || !hasAggregatedData) ? (*/}
      {/*  <NoDataPlaceholder onButtonClick={onClearAll} />*/}
      {/*) : (*/}
      {/*  <LineChart*/}
      {/*    customOptions={customChartOptions}*/}
      {/*    customTooltipFormatter={customTooltipFormatter}*/}
      {/*    key={groupBy}*/}
      {/*    groupBy={groupBy}*/}
      {/*    legends={legends}*/}
      {/*    aggregatedSeries={aggregatedSeries}*/}
      {/*    className='max-h-fit'*/}
      {/*    isLegendEnabled={isLegendEnabled}*/}
      {/*    resetZoomKey={`${barSize}-${dateRange.startDate}-${dateRange.endDate}`}*/}
      {/*    events={events}*/}
      {/*    showEvents={showEvents}*/}
      {/*    onSelectAllLegends={onSelectAllLegends}*/}
      {/*    onDeselectAllLegends={onDeselectAllLegends}*/}
      {/*    onShowEvents={setIsShowEvents}*/}
      {/*    onLegendHover={onLegendHover}*/}
      {/*    onLegendLeave={onLegendUnhover}*/}
      {/*    onLegendClick={onLegendToggle}*/}
      {/*  />*/}
      {/*)}*/}
    </Card>
  );
};

export default TotalTreasuryValue;
