import React, { memo, useCallback, useMemo, useReducer } from 'react';
import { CSVLink } from 'react-csv';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import Filter from '@/components/Filter/Filter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SpecificLineChart from '@/entities/Capo/SpecificLineChart';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useModal } from '@/shared/hooks/useModal';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { BarSize, OptionType } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface SpecificCollateralPriceProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

interface FiltersProps {
  chainOptions: OptionType[];

  marketOptionsFilter: OptionType[];

  collateralOptions: OptionType[];

  barSize: BarSize;

  showEvents: boolean;

  isLoading: boolean;

  csvFilename: string;

  isShowEyeIcon: boolean;

  isShowCalendarIcon: boolean;

  csvData: Record<string, string | number>[];

  areAllSeriesHidden: boolean;

  selectedOptions: {
    chain: OptionType[];

    market: OptionType[];

    collateral: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectMarket: (market: OptionType[]) => void;

  onSelectCollateral: (collateral: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  onClearAll: () => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  onShowEvents: (value: boolean) => void;
}

const groupByMapping: Record<string, string> = {
  chain: 'chain',

  market: 'market',

  collateral: 'collateral'
};

const SpecificCollateralPrice = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: SpecificCollateralPriceProps) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      market: [] as OptionType[],
      collateral: [] as OptionType[]
    }
  );

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    if (!treasuryApiResponse) {
      return [];
    }
    return [...treasuryApiResponse].sort((a, b) => a.date - b.date);
  }, [treasuryApiResponse]);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' },
      collateral: { path: 'source.asset.type' }
    }),
    []
  );

  const { chainOptions, collateralOptions, marketOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const marketOptionsFilter = useMemo(() => {
    const marketV2 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = marketOptions?.find(
      (el) => el.id.toLowerCase() === 'no name'
    );

    const selectedChainIds = selectedOptions.chain.map((o) => o.id);

    let allMarkets = [...marketV3, ...marketV2];

    if (noMarkets) {
      allMarkets = [...allMarkets, noMarkets];
    }

    if (selectedChainIds.length) {
      return allMarkets.filter(
        (el) => el.chain?.some((c) => selectedChainIds.includes(c)) ?? false
      );
    }

    return allMarkets;
  }, [marketOptions, selectedOptions]);

  const groupBy = 'chain';

  const activeFilters = useMemo(
    () =>
      Object.entries(selectedOptions).reduce(
        (acc, [key, options]) => {
          acc[key] = options.map((option: OptionType) => option.id);
          return acc;
        },
        {} as Record<string, string[]>
      ),
    [selectedOptions]
  );

  const { chartSeries } = useChartDataProcessor({
    rawData,
    filters: activeFilters,
    filterPaths: {
      chain: 'source.network',
      market: 'source.market',
      collateral: 'source.asset.type'
    },
    groupBy,
    groupByKeyPath:
      filterOptionsConfig[
        groupByMapping[groupBy] as keyof typeof filterOptionsConfig
      ].path,
    defaultSeriesName: 'Treasury Value'
  });

  const correctedChartSeries = useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) {
      return [];
    }

    return chartSeries.map((series) => {
      if (!series.data || series.data.length === 0) {
        return series;
      }

      const dailyTotals = new Map<number, number>();

      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        const dayStartTimestamp = date.getTime();

        const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
        dailyTotals.set(dayStartTimestamp, currentTotal + point.y);
      }

      const aggregatedData = Array.from(dailyTotals.entries()).map(
        ([x, y]) => ({
          x,
          y
        })
      );

      aggregatedData.sort((a, b) => a.x - b.x);

      return {
        ...series,
        data: aggregatedData
      };
    });
  }, [chartSeries]);

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: correctedChartSeries,
    barSize,
    groupBy,
    filePrefix: 'Total_Treasury_Value',
    aggregationType: 'sum'
  });

  const hasData = useMemo(() => {
    return (
      correctedChartSeries.length > 0 &&
      correctedChartSeries.some((s) => s.data.length > 0)
    );
  }, [correctedChartSeries]);

  const {
    chartRef,
    eventsData,
    showEvents,
    isLegendEnabled,
    aggregatedSeries,
    areAllSeriesHidden,
    onAllSeriesHidden,
    onEventsData,
    onShowEvents,
    onSelectAll,
    onDeselectAll
  } = useLineChart({
    groupBy,
    data: correctedChartSeries,
    barSize
  });

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.market.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );
      setSelectedOptions({ chain, deployment: filteredDeployment });
    },
    [selectedOptions.market]
  );

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      market: selectedOptions
    });
  }, []);

  const onSelectCollateral = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      collateral: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      market: [],
      collateral: []
    });
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Specific Collateral Price against Price Restriction'
      id='specific-collateral-price-against-price-restriction'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <Filters
        showEvents={showEvents}
        areAllSeriesHidden={areAllSeriesHidden}
        isShowCalendarIcon={Boolean(eventsData.length > 0)}
        isShowEyeIcon={Boolean(isLegendEnabled && aggregatedSeries.length > 1)}
        collateralOptions={collateralOptions}
        selectedOptions={selectedOptions}
        chainOptions={chainOptions}
        marketOptionsFilter={marketOptionsFilter}
        isLoading={isLoading || false}
        barSize={barSize}
        csvData={csvData}
        csvFilename={csvFilename}
        onSelectChain={onSelectChain}
        onSelectCollateral={onSelectCollateral}
        onSelectMarket={onSelectMarket}
        onBarSizeChange={onBarSizeChange}
        onClearAll={onClearAll}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onShowEvents={onShowEvents}
      />
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
      ) : (
        <SpecificLineChart
          key={groupBy}
          data={correctedChartSeries}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          chartRef={chartRef}
          isLegendEnabled={isLegendEnabled}
          eventsData={eventsData}
          showEvents={showEvents}
          areAllSeriesHidden={areAllSeriesHidden}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
        />
      )}
    </Card>
  );
};

const Filters = memo(
  ({
    barSize,
    isShowEyeIcon,
    isShowCalendarIcon,
    showEvents,
    csvData,
    csvFilename,
    areAllSeriesHidden,
    chainOptions,
    selectedOptions,
    marketOptionsFilter,
    collateralOptions,
    isLoading,
    onSelectChain,
    onSelectCollateral,
    onSelectMarket,
    onBarSizeChange,
    onClearAll,
    onSelectAll,
    onDeselectAll,
    onShowEvents
  }: FiltersProps) => {
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
        total: selectedOptions.market.length,
        selectedOptions: selectedOptions.market,
        options: marketOptionsFilter || [],
        onChange: onSelectMarket
      };

      const assetTypeFilterOptions = {
        id: 'collateral',
        placeholder: 'Collateral',
        total: selectedOptions.collateral.length,
        selectedOptions: selectedOptions.collateral,
        options:
          collateralOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
          [],
        onChange: onSelectCollateral
      };

      return [chainFilterOptions, marketFilterOptions, assetTypeFilterOptions];
    }, [
      collateralOptions,
      chainOptions,
      marketOptionsFilter,
      onSelectCollateral,
      onSelectChain,
      onSelectMarket,
      selectedOptions
    ]);

    const onEyeClick = () => {
      if (areAllSeriesHidden) {
        onSelectAll();
      } else {
        onDeselectAll();
      }

      onMoreClose();
    };

    const onCalendarClick = () => {
      onShowEvents(!showEvents);

      onMoreClose();
    };

    return (
      <>
        <div className='block lg:hidden'>
          <div className='flex flex-col justify-end gap-2 px-5 py-3 md:px-0 lg:px-5'>
            <div className='flex flex-col-reverse items-center justify-end gap-2 sm:flex-row'>
              <TabsGroup
                className={{
                  container: 'w-full sm:w-auto',
                  list: 'w-full sm:w-auto'
                }}
                tabs={['D', 'W', 'M']}
                value={barSize}
                onTabChange={onBarSizeChange}
                disabled={isLoading}
              />
              <div className='flex w-full items-center gap-2 sm:w-auto'>
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
            </div>
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
                        'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
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
                        'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
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
        <div className='hidden lg:block'>
          <div className='flex items-center justify-end gap-2 px-0 py-3'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
            />
            <MultiSelect
              type='valueInTrigger'
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              type='valueInTrigger'
              options={marketOptionsFilter}
              value={selectedOptions.market}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(marketOptionsFilter.length)}
            />
            <MultiSelect
              type='valueInTrigger'
              options={
                collateralOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.collateral}
              onChange={onSelectCollateral}
              placeholder='Collateral'
              disabled={isLoading}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
      </>
    );
  }
);

export default SpecificCollateralPrice;
