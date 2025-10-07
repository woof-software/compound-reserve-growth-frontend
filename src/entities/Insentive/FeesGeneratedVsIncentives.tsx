import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';
import { CSVLink } from 'react-csv';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
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
import Switch from '@/shared/ui/Switch/Switch';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const groupByMapping: Record<string, string> = {
  Chain: 'chain',

  Market: 'deployment'
};

interface FeesGeneratedVsIncentivesProps {
  isLoading?: boolean;

  isError?: boolean;

  data?: TokenData[];

  onCopyLink?: (id: string) => void;
}

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  barSize: BarSize;

  isLoading: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    deployment: OptionType[];
  };

  areAllSeriesHidden: boolean;

  onSelectChain: (chain: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onBarSizeChange: (value: string) => void;

  onClearAll: () => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;
}

const FeesGeneratedVsIncentives = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: FeesGeneratedVsIncentivesProps) => {
  const [resetHiddenKey, setResetHiddenKey] = useState(0);

  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      deployment: [] as OptionType[]
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
      deployment: { path: 'source.market' }
    }),
    []
  );

  const { chainOptions, deploymentOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = deploymentOptions?.find(
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
  }, [deploymentOptions, selectedOptions]);

  const groupBy: 'Chain' | 'Market' = 'Chain';

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
      deployment: 'source.market'
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

  const {
    chartRef,
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

  const hasData = useMemo(() => {
    return (
      correctedChartSeries.length > 0 &&
      correctedChartSeries.some((s) => s.data.length > 0)
    );
  }, [correctedChartSeries]);

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.deployment.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );

      setSelectedOptions({ chain, deployment: filteredDeployment });
    },
    [selectedOptions.chain.length, selectedOptions.deployment]
  );

  const onSelectMarket = useCallback((deployments: OptionType[]) => {
    setSelectedOptions({
      deployment: deployments
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      deployment: []
    });

    setResetHiddenKey((k) => k + 1);
  }, []);

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
  }, [onClearSelectedOptions]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Fees Generated vs Incentives'
      id='fees-generated-vs-incentives'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <Filters
        selectedOptions={selectedOptions}
        chainOptions={chainOptions}
        deploymentOptionsFilter={deploymentOptionsFilter}
        isLoading={isLoading || false}
        barSize={barSize}
        csvData={csvData}
        areAllSeriesHidden={areAllSeriesHidden}
        csvFilename={csvFilename}
        onSelectChain={onSelectChain}
        onSelectMarket={onSelectMarket}
        onBarSizeChange={onBarSizeChange}
        onClearAll={onClearAll}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
      ) : (
        <LineChart
          className='max-h-fit'
          key={groupBy}
          resetHiddenKey={resetHiddenKey}
          data={correctedChartSeries}
          groupBy={groupBy}
          chartRef={chartRef}
          isLegendEnabled={isLegendEnabled}
          aggregatedSeries={aggregatedSeries}
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
    csvData,
    csvFilename,
    chainOptions,
    selectedOptions,
    areAllSeriesHidden,
    deploymentOptionsFilter,
    isLoading,
    onSelectChain,
    onSelectMarket,
    onBarSizeChange,
    onClearAll,
    onSelectAll,
    onDeselectAll
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
        total: selectedOptions.deployment.length,
        selectedOptions: selectedOptions.deployment,
        options: deploymentOptionsFilter || [],
        onChange: onSelectMarket
      };

      return [chainFilterOptions, marketFilterOptions];
    }, [
      chainOptions,
      deploymentOptionsFilter,
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

    return (
      <>
        <div className='block lg:hidden'>
          <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
            <div className='flex flex-row justify-end gap-2'>
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
              <Button
                onClick={onOpenModal}
                className='bg-secondary-27 text-gray-11 shadow-13 hidden h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:flex sm:w-auto md:h-8'
              >
                <Icon
                  name='filters'
                  className='h-[14px] w-[14px] fill-none'
                />
                Filters
              </Button>
            </div>
            <div className='flex flex-row items-center justify-end gap-2'>
              <div className='flex w-full flex-row-reverse items-center gap-2 sm:w-auto sm:flex-row'>
                <Button
                  onClick={onOpenModal}
                  className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:hidden sm:w-auto md:h-8'
                >
                  <Icon
                    name='filters'
                    className='h-[14px] w-[14px] fill-none'
                  />
                  Filters
                </Button>
                <Switch
                  label='Fees Only'
                  positionLabel='left'
                  checked={false}
                  onCheckedChange={() => {}}
                  className={{ title: '!text-[11px]' }}
                />
              </div>
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
                    Unselect All
                  </Text>
                </ChartIconToggle>
              </div>
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
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <Switch
              label='Fees Only'
              positionLabel='left'
              checked={false}
              onCheckedChange={() => {}}
              className={{ title: '!text-[11px]' }}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
              tooltipContent='CSV with the entire historical data can be downloaded'
            />
          </div>
        </div>
      </>
    );
  }
);

export default FeesGeneratedVsIncentives;
