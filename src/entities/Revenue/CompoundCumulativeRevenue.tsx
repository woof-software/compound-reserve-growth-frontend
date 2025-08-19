import React, { useCallback, useMemo, useReducer } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import {
  MultiSelect,
  MultiSelectDrawer
} from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
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
  barSize: BarSize;
  activeTab: TimeRange | null;
  isLoading: boolean;
  csvFilename: string;
  csvData: Record<string, string | number>[];
  selectedOptions: {
    chain: OptionType[];
    assetType: OptionType[];
    deployment: OptionType[];
    symbol: OptionType[];
  };
  onSelectChain: (chain: OptionType[]) => void;
  onSelectAssetType: (assetType: OptionType[]) => void;
  onSelectMarket: (deployment: OptionType[]) => void;
  onSelectSymbol: (symbol: OptionType[]) => void;
  handleBarSizeChange: (value: string) => void;
  handleTabChange: (value: string) => void;
  onClearAll: () => void;
}

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

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleResetActiveTab,
    handleBarSizeChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    return [...revenueData].sort((a, b) => a.date - b.date);
  }, [revenueData]);

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
    defaultSeriesName: 'Daily Revenue'
  });

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

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: cumulativeChartSeries,
    barSize,
    groupBy,
    filePrefix: 'Compound_Cumulative_Revenue',
    aggregationType: 'last'
  });

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
    selectedOptions.assetType.length > 0
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
        deploymentOptions: filteredDeployment
      });
    },
    [selectedOptions]
  );

  const onSelectAssetType = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      assetType: selectedOptions
    });
  }, []);

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onSelectSymbol = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      symbol: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    });
  }, []);

  return (
    <Card
      title='Compound Cumulative Revenue'
      id='compound-cumulative-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-2 md:px-10 md:pb-10'
      }}
    >
      <Filters
        barSize={barSize}
        activeTab={activeTab}
        csvData={csvData}
        csvFilename={csvFilename}
        chainOptions={chainOptions}
        selectedOptions={selectedOptions}
        deploymentOptionsFilter={deploymentOptionsFilter}
        assetTypeOptions={assetTypeOptions}
        symbolOptions={symbolOptions}
        isLoading={isLoading}
        onSelectChain={onSelectChain}
        onSelectAssetType={onSelectAssetType}
        onSelectMarket={onSelectMarket}
        onSelectSymbol={onSelectSymbol}
        handleBarSizeChange={handleBarSizeChange}
        handleTabChange={handleTabChange}
        onClearAll={onClearSelectedOptions}
      />
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder
          onButtonClick={onClearSelectedOptions}
          text={noDataMessage}
        />
      ) : (
        <LineChart
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          data={cumulativeChartSeries}
          groupBy={getGroupByForChart()}
          showLegend={false}
          onZoom={handleResetActiveTab}
        />
      )}
    </Card>
  );
};

const Filters = ({
  barSize,
  activeTab,
  csvData,
  csvFilename,
  chainOptions,
  selectedOptions,
  deploymentOptionsFilter,
  assetTypeOptions,
  symbolOptions,
  isLoading,
  onSelectChain,
  onSelectAssetType,
  onSelectMarket,
  onSelectSymbol,
  handleBarSizeChange,
  handleTabChange,
  onClearAll
}: FiltersProps) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  return (
    <>
      <View.Tablet>
        <div className='hidden items-center justify-end gap-3 px-0 py-3 lg:flex'>
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
          <TabsGroup
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={handleBarSizeChange}
            disabled={isLoading}
          />
          <TabsGroup
            tabs={['7B', '30B', '90B', '180B']}
            value={activeTab}
            onTabChange={handleTabChange}
            disabled={isLoading}
          />
          <CSVDownloadButton
            data={csvData}
            filename={csvFilename}
          />
        </div>
        <div className='flex flex-col items-end justify-end gap-3 px-0 py-3 lg:hidden'>
          <div className='z-[1] flex items-center gap-2'>
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
          <div className='flex items-center gap-3'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={handleBarSizeChange}
              disabled={isLoading}
            />
            <TabsGroup
              tabs={['7B', '30B', '90B', '180B']}
              value={activeTab}
              onTabChange={handleTabChange}
              disabled={isLoading}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
      </View.Tablet>
      <View.Mobile>
        <div className='flex flex-wrap justify-end gap-3 px-6 py-3'>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={handleBarSizeChange}
              disabled={isLoading}
            />
            <TabsGroup
              tabs={['7B', '30B', '90B', '180B']}
              value={activeTab}
              onTabChange={handleTabChange}
              disabled={isLoading}
            />
          </div>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <Button
              onClick={onOpenModal}
              className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px]'
              />
              Filters
            </Button>
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
          <Drawer
            isOpen={isOpen}
            onClose={onCloseModal}
          >
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='mb-8 w-full'
            >
              Filters
            </Text>
            <div className='grid gap-3 px-2'>
              <MultiSelectDrawer
                options={chainOptions || []}
                value={selectedOptions.chain}
                onChange={onSelectChain}
                placeholder='Chain'
                disabled={isLoading}
              />
              <MultiSelectDrawer
                options={deploymentOptionsFilter || []}
                value={selectedOptions.deployment}
                onChange={onSelectMarket}
                placeholder='Market'
                disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
              />
              <MultiSelectDrawer
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
              <MultiSelectDrawer
                options={
                  symbolOptions?.sort((a, b) =>
                    a.label.localeCompare(b.label)
                  ) || []
                }
                value={selectedOptions.symbol}
                onChange={onSelectSymbol}
                placeholder='Reserve Symbols'
                disabled={isLoading}
              />
            </div>
            <div className='w-full px-2'>
              <Button
                className='bg-secondary-14 mx-2 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'
                onClick={onClearAll}
              >
                Clear Filters
              </Button>
            </div>
          </Drawer>
        </div>
      </View.Mobile>
    </>
  );
};

export default CompoundCumulativeRevenue;
