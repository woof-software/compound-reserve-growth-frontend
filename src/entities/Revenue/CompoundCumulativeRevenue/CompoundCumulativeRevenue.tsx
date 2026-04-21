import React, {
  Dispatch,
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
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Revenue/CompoundCumulativeRevenue/customChartOptions';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useDateRangeFilter } from '@/shared/hooks/useDataRangeFilter';
import { useEventsApi } from '@/shared/hooks/useEventsApi';
import { useFiltersSync } from '@/shared/hooks/useFiltersSync';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { getMaxBarSizeForRange } from '@/shared/lib/date/dateUtils';
import { filterForRange } from '@/shared/lib/utils/chart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import {
  ChartDataItem,
  extractFilterOptions,
  filterAndSortMarkets
} from '@/shared/lib/utils/utils';
import { BAR_SIZE, BAR_SIZE_OPTIONS, OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import { DateRangePickerPopover } from '@/shared/ui/DateRangePicker/DateRangePicker';
import { DateRangeValue } from '@/shared/ui/DateRangePicker/types';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BAR_SIZE;

  disabledBarSizes: BAR_SIZE[];

  isLoading: boolean;

  showEvents: boolean;

  isShowCalendarIcon: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  dateRange: DateRangeValue;

  minDate: number | null;

  maxDate: number | null;

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  isShowEyeIcon: boolean;

  areAllSeriesHidden: boolean;

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  onDateRangeChange: Dispatch<SetStateAction<DateRangeValue>>;

  onClearAll: () => void;

  onShowEvents: (value: boolean) => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;
}

const BAR_SIZE_ORDER = {
  [BAR_SIZE.D]: 0,
  [BAR_SIZE.W]: 1,
  [BAR_SIZE.M]: 2
} as const;

const CompoundCumulativeRevenue = ({
  revenueData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      assetType: [] as OptionType[],
      deployment: [] as OptionType[],
      symbol: [] as OptionType[]
    }
  );

  useFiltersSync(selectedOptions, setSelectedOptions, 'ccr', [
    'chain',
    'assetType',
    'deployment',
    'symbol'
  ]);

  const {
    dateRange,
    setDateRange,
    normalizedDateRange,
    dateBounds,
    resetDateRange,
    mobileFilterOption: dateRangeMobileOption
  } = useDateRangeFilter();

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: BAR_SIZE.D
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    return [...revenueData].sort((a, b) => a.date - b.date);
  }, [revenueData]);

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

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      deployment: { path: 'source.market' },
      symbol: { path: 'source.asset.symbol' },
      assetType: { path: 'source.asset.type' }
    }),
    []
  );

  const { chainOptions, deploymentOptions, symbolOptions, assetTypeOptions } =
    useMemo(
      () => extractFilterOptions(rawData, filterOptionsConfig),
      [rawData, filterOptionsConfig]
    );

  const deploymentOptionsFilter = useMemo(() => {
    return filterAndSortMarkets(
      deploymentOptions,
      selectedOptions.chain.map((o) => o.id)
    );
  }, [deploymentOptions, selectedOptions]);

  const groupBy = useMemo(() => {
    if (selectedOptions.deployment.length > 0) return 'market';
    if (selectedOptions.chain.length > 0) return 'network';
    return 'none';
  }, [selectedOptions]);

  const { chartSeries } = useChartDataProcessor({
    rawData,
    filters: {
      network: selectedOptions.chain.map((opt) => opt.id),
      market: selectedOptions.deployment.map((opt) => opt.id),
      symbol: selectedOptions.symbol.map((opt) => opt.id),
      assetType: selectedOptions.assetType.map((opt) => opt.id)
    },
    filterPaths: {
      network: 'source.network',
      market: 'source.market',
      symbol: 'source.asset.symbol',
      assetType: 'source.asset.type'
    },
    groupBy,
    groupByKeyPath: groupBy === 'none' ? null : `source.${groupBy}`,
    defaultSeriesName: 'Daily Revenue',
    dateRange: normalizedDateRange
  });

  const a = chartSeries[0]!;

  const cumulativeChartSeries = useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) {
      return [];
    }

    return chartSeries.map((series) => {
      if (!series.data || series.data.length === 0) {
        return { ...series, data: [] };
      }

      const dailyTotals = new Map<number, number>();
      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        const dayStartTimestamp = date.getTime();
        const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
        const valueToAdd = point.y < 0 ? 0 : point.y;
        dailyTotals.set(dayStartTimestamp, currentTotal + valueToAdd);
      }

      const sortedDailyPoints = Array.from(dailyTotals.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);

      if (sortedDailyPoints.length === 0) {
        return { ...series, data: [] };
      }

      const cumulativeData: { x: number; y: number }[] = [];
      const minDate = sortedDailyPoints[0].x;
      const maxDate = sortedDailyPoints[sortedDailyPoints.length - 1].x;
      const oneDay = 24 * 60 * 60 * 1000;

      let cumulativeSum = 0;
      let dataIndex = 0;

      for (let d = minDate; d <= maxDate; d += oneDay) {
        if (
          dataIndex < sortedDailyPoints.length &&
          sortedDailyPoints[dataIndex].x === d
        ) {
          cumulativeSum += sortedDailyPoints[dataIndex].y;
          dataIndex++;
        }
        cumulativeData.push({ x: d, y: cumulativeSum });
      }

      return {
        ...series,
        name: series.name.replace('Daily', 'Cumulative'),
        data: cumulativeData
      };
    });
  }, [chartSeries]);

  const csvData = filterForRange({
    data: cumulativeChartSeries[0]?.data ?? [],
    getDate: (item) => new Date(item.x),
    transform: (item) => ({
      Date: new Date(item.x).toISOString().split('T')[0],
      'Cumulative revenue': item.y
    }),
    range: barSize
  });

  const { isLegendEnabled, aggregatedSeries } = useLineChart({
    groupBy,
    data: cumulativeChartSeries,
    barSize
  });

  const hasAggregatedData = useMemo(
    () =>
      aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0),
    [aggregatedSeries]
  );

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

  const isSeriesHidden = legends.every((l) => l.isDisabled);

  const [isShowEvents, setIsShowEvents] = useState<boolean>(true);

  const { data: events } = useEventsApi();

  const hasData = useMemo(() => {
    return (
      cumulativeChartSeries.length > 0 &&
      cumulativeChartSeries.some((s) => s.data.length > 0)
    );
  }, [cumulativeChartSeries]);

  const noDataMessage =
    selectedOptions.chain.length > 0 ||
    selectedOptions.deployment.length > 0 ||
    selectedOptions.symbol.length > 0 ||
    selectedOptions.assetType.length > 0 ||
    dateRange.startDate !== null ||
    dateRange.endDate !== null
      ? 'No data for selected filters'
      : 'No data available';

  const getGroupByForChart = () => {
    if (groupBy === 'none') {
      return 'none';
    }
    return groupBy === 'market' ? 'Market' : 'Chain';
  };

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.deployment.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );

      setSelectedOptions({
        chain,
        deployment: filteredDeployment
      });
    },
    [selectedOptions.deployment]
  );

  const onSelectAssetType = useCallback((assetTypes: OptionType[]) => {
    setSelectedOptions({
      assetType: assetTypes
    });
  }, []);

  const onSelectMarket = useCallback((deployments: OptionType[]) => {
    setSelectedOptions({
      deployment: deployments
    });
  }, []);

  const onSelectSymbol = useCallback((symbols: OptionType[]) => {
    setSelectedOptions({
      symbol: symbols
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    });
    resetDateRange();
  }, [resetDateRange]);

  return (
    <Card
      title='Compound Cumulative Revenue'
      id='compound-cumulative-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[550px] border',
        content: 'flex flex-col gap-3 p-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <Filters
        barSize={barSize}
        disabledBarSizes={disabledBarSizes}
        csvData={csvData}
        areAllSeriesHidden={isSeriesHidden}
        isShowEyeIcon={Boolean(isLegendEnabled && aggregatedSeries.length > 1)}
        showEvents={isShowEvents}
        csvFilename={getCsvFileName('compound_cumulative_revenue')}
        chainOptions={chainOptions}
        dateRange={dateRange}
        minDate={dateBounds.min}
        maxDate={dateBounds.max}
        selectedOptions={selectedOptions}
        isShowCalendarIcon={!!events?.length}
        deploymentOptionsFilter={deploymentOptionsFilter}
        assetTypeOptions={assetTypeOptions}
        symbolOptions={symbolOptions}
        isLoading={isLoading}
        onSelectChain={onSelectChain}
        onSelectAssetType={onSelectAssetType}
        onSelectMarket={onSelectMarket}
        onSelectSymbol={onSelectSymbol}
        onBarSizeChange={onBarSizeChange}
        onDateRangeChange={setDateRange}
        onClearAll={onClearSelectedOptions}
        onShowEvents={setIsShowEvents}
        onSelectAll={onSelectAllLegends}
        onDeselectAll={onDeselectAllLegends}
        dateRangeMobileOption={dateRangeMobileOption}
      />
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder
          onButtonClick={onClearSelectedOptions}
          text={noDataMessage}
        />
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
          resetZoomKey={`${barSize}-${dateRange.startDate}-${dateRange.endDate}`}
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

const Filters = ({
  barSize,
  disabledBarSizes,
  csvData,
  csvFilename,
  chainOptions,
  dateRange,
  minDate,
  maxDate,
  selectedOptions,
  deploymentOptionsFilter,
  isShowEyeIcon,
  areAllSeriesHidden,
  assetTypeOptions,
  symbolOptions,
  showEvents,
  isShowCalendarIcon,
  isLoading,
  dateRangeMobileOption,
  onSelectChain,
  onSelectAssetType,
  onSelectMarket,
  onSelectSymbol,
  onBarSizeChange,
  onDateRangeChange,
  onClearAll,
  onShowEvents,
  onSelectAll,
  onDeselectAll
}: FiltersProps & {
  dateRangeMobileOption: ReturnType<
    typeof useDateRangeFilter
  >['mobileFilterOption'];
}) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  const {
    isOpen: isMoreOpen,
    onOpenModal: onMoreOpen,
    onCloseModal: onMoreClose
  } = useModal();

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
      total: selectedOptions.deployment.length,
      selectedOptions: selectedOptions.deployment,
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    const assetTypeFilterOptions = {
      id: 'assetType',
      placeholder: 'Asset Type',
      total: selectedOptions.assetType.length,
      selectedOptions: selectedOptions.assetType,
      options:
        assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectAssetType
    };

    const symbolFilterOptions = {
      id: 'reserveSymbol',
      placeholder: 'Reserve Symbols',
      total: selectedOptions.symbol.length,
      selectedOptions: selectedOptions.symbol,
      options:
        symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectSymbol
    };

    return [
      dateRangeMobileOption,
      chainFilterOptions,
      marketFilterOptions,
      assetTypeFilterOptions,
      symbolFilterOptions
    ];
  }, [
    assetTypeOptions,
    chainOptions,
    dateRangeMobileOption,
    deploymentOptionsFilter,
    onSelectAssetType,
    onSelectChain,
    onSelectMarket,
    onSelectSymbol,
    selectedOptions,
    symbolOptions
  ]);

  const onCalendarClick = () => {
    onShowEvents(!showEvents);
    onMoreClose();
  };

  const onEyeClick = () => {
    if (areAllSeriesHidden) {
      onSelectAll();
    } else {
      onDeselectAll();
    }
    onMoreClose();
  };

  return (
    <>
      <div className='hidden lg:block'>
        <div className='hidden items-center justify-end gap-2 px-0 py-3 lg:flex'>
          <TabsGroup
            tabs={BAR_SIZE_OPTIONS}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
          <DateRangePickerPopover
            value={dateRange}
            min={minDate}
            max={maxDate}
            onChange={onDateRangeChange}
            disabled={isLoading}
            showLabels
            inputClassName='w-full'
          />
          <div className='flex gap-2'>
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                assetTypeOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.assetType}
              onChange={onSelectAssetType}
              placeholder='Asset Type'
              disabled={isLoading}
            />
            <MultiSelect
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <CSVDownloadButton
            data={csvData}
            filename={csvFilename}
          />
        </div>
        <div className='flex flex-col items-end justify-end gap-2 px-0 py-3 lg:hidden'>
          <div className='z-[1] flex items-center gap-2'>
            <DateRangePickerPopover
              value={dateRange}
              min={minDate}
              max={maxDate}
              onChange={onDateRangeChange}
              disabled={isLoading}
              showLabels
              inputClassName='w-full'
            />
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                assetTypeOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.assetType}
              onChange={onSelectAssetType}
              placeholder='Asset Type'
              disabled={isLoading}
            />
            <MultiSelect
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <div className='flex items-center gap-2'>
            <TabsGroup
              tabs={BAR_SIZE_OPTIONS}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
              disabledTabs={disabledBarSizes}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
      </div>
      <div className='block lg:hidden'>
        <div className='flex flex-wrap justify-end gap-2 px-5 py-3 md:px-0'>
          <div className='flex w-full flex-row items-center justify-end gap-2 sm:w-auto'>
            <TabsGroup
              className={{
                container: 'w-full sm:w-auto',
                list: 'w-full sm:w-auto'
              }}
              tabs={BAR_SIZE_OPTIONS}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
              disabledTabs={disabledBarSizes}
            />
            <Button
              onClick={onOpenModal}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px] fill-none'
              />
              Filters
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
          <Filter
            isOpen={isOpen}
            filterOptions={filterOptions}
            onClose={onCloseModal}
            onClearAll={onClearAll}
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
                  data={csvData}
                  filename={csvFilename}
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
              <View.Condition if={isShowEyeIcon}>
                <div className='px-3 py-2'>
                  <ChartIconToggle
                    active={areAllSeriesHidden}
                    onIcon='eye'
                    offIcon='eye-closed'
                    ariaLabel='Toggle all series visibility'
                    className={{
                      container:
                        'flex items-center gap-1.5 bg-transparent p-0 shadow-none',
                      icon: 'h-[26px] w-[26px]',
                      iconContainer: 'h-[26px] w-[26px]'
                    }}
                    onClick={onEyeClick}
                  >
                    <Text
                      size='14'
                      weight='500'
                    >
                      {areAllSeriesHidden ? 'Select All' : 'Unselect All'}
                    </Text>
                  </ChartIconToggle>
                </div>
              </View.Condition>
              <View.Condition if={isShowCalendarIcon}>
                <div className='px-3 py-2'>
                  <ChartIconToggle
                    active={!showEvents}
                    onIcon='calendar-check'
                    offIcon='calendar-uncheck'
                    ariaLabel='Toggle events'
                    className={{
                      container:
                        'flex items-center gap-1.5 bg-transparent p-0 shadow-none',
                      icon: 'h-[26px] w-[26px]',
                      iconContainer: 'h-[26px] w-[26px]'
                    }}
                    onClick={onCalendarClick}
                  >
                    <Text
                      size='14'
                      weight='500'
                    >
                      Hide Events
                    </Text>
                  </ChartIconToggle>
                </div>
              </View.Condition>
            </div>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default CompoundCumulativeRevenue;
