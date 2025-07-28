import { useCallback, useMemo, useState } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const CompoundCumulativeRevenue = ({
  revenueData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<OptionType[]>([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<OptionType[]>(
    []
  );

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const handleResetFilters = useCallback(() => {
    setSelectedChains([]);
    setSelectedMarkets([]);
    setSelectedSymbols([]);
    setSelectedAssetTypes([]);
  }, []);

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
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const marketV3 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const noMarkets = deploymentOptions?.find(
      (el) => el?.id?.toLowerCase() === 'no name'
    );

    if (noMarkets) {
      return [...marketV3, ...marketV2, noMarkets];
    }

    return [...marketV3, ...marketV2];
  }, [deploymentOptions, selectedChains]);

  const groupBy = useMemo(() => {
    if (selectedMarkets.length > 0) return 'market';
    if (selectedChains.length > 0) return 'network';
    return 'none';
  }, [selectedChains, selectedMarkets]);

  const { chartSeries } = useChartDataProcessor({
    rawData,
    filters: {
      network: selectedChains.map((opt) => opt.id),
      market: selectedMarkets.map((opt) => opt.id),
      symbol: selectedSymbols.map((opt) => opt.id),
      assetType: selectedAssetTypes.map((opt) => opt.id)
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
        if (point.y > 0) {
          const date = new Date(point.x);
          date.setUTCHours(0, 0, 0, 0);
          const dayStartTimestamp = date.getTime();
          const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
          dailyTotals.set(dayStartTimestamp, currentTotal + point.y);
        }
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
    selectedChains.length > 0 ||
    selectedMarkets.length > 0 ||
    selectedSymbols.length > 0 ||
    selectedAssetTypes.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  const getGroupByForChart = () => {
    if (groupBy === 'none') {
      return 'none';
    }
    return groupBy === 'market' ? 'Market' : 'Chain';
  };

  const onSelectChain = useCallback((selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);

    setSelectedMarkets([]);
  }, []);

  return (
    <Card
      title='Compound Cumulative Revenue'
      id='compound-cumulative-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={chainOptions || []}
            value={selectedChains}
            onChange={onSelectChain}
            placeholder='Chain'
            disabled={isLoading}
          />
          <MultiSelect
            options={assetTypeOptions || []}
            value={selectedAssetTypes}
            onChange={setSelectedAssetTypes}
            placeholder='Asset Type'
            disabled={isLoading}
          />
          <MultiSelect
            options={deploymentOptionsFilter || []}
            value={selectedMarkets}
            onChange={setSelectedMarkets}
            placeholder='Market'
            disabled={isLoading}
          />
          <MultiSelect
            options={symbolOptions || []}
            value={selectedSymbols}
            onChange={setSelectedSymbols}
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
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      ) : (
        <LineChart
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          onVisibleBarsChange={handleVisibleBarsChange}
          data={cumulativeChartSeries}
          groupBy={getGroupByForChart()}
          showLegend={false}
        />
      )}
    </Card>
  );
};

export default CompoundCumulativeRevenue;
