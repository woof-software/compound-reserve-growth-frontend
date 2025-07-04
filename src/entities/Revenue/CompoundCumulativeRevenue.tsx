import { useMemo, useState } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCompCumulativeRevenue } from '@/shared/hooks/useCompCumulativeRevenuets';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const CompoundCumulativeRevenue = () => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);

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

  const { data: apiResponse, isLoading, isError } = useCompCumulativeRevenue();

  const rawData: ChartDataItem[] = useMemo(
    () => apiResponse?.data?.data || [],
    [apiResponse]
  );

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' }
    }),
    []
  );

  const { chainOptions, marketOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const groupBy = useMemo(() => {
    if (selectedMarkets.length > 0) return 'market';
    if (selectedChains.length > 0) return 'network';
    return 'none';
  }, [selectedChains, selectedMarkets]);

  const { chartSeries, hasData } = useChartDataProcessor({
    rawData,
    filters: {
      network: selectedChains.map((opt) => opt.id),
      market: selectedMarkets.map((opt) => opt.id)
    },
    filterPaths: {
      network: 'source.network',
      market: 'source.market'
    },
    groupBy,
    groupByKeyPath: groupBy === 'none' ? null : `source.${groupBy}`,
    defaultSeriesName: 'Cumulative Revenue'
  });

  const cumulativeChartSeries = useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) {
      return [];
    }

    return chartSeries.map((series) => {
      if (!series.data || series.data.length === 0) {
        return { ...series, data: [] };
      }

      const sortedData = [...series.data].sort((a, b) => a.x - b.x);

      let cumulativeY = 0;

      const cumulativeData = sortedData.map((dataPoint) => {
        cumulativeY += dataPoint.y < 0 ? 0 : dataPoint.y;
        return {
          x: dataPoint.x,
          y: cumulativeY
        };
      });

      return {
        ...series,
        data: cumulativeData
      };
    });
  }, [chartSeries]);

  const noDataMessage =
    selectedChains.length > 0 || selectedMarkets.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  const getGroupByForChart = () => {
    if (groupBy === 'none') {
      return 'none';
    }
    return groupBy === 'market' ? 'Market' : 'Chain';
  };

  return (
    <Card
      title='Compound Cumulative Revenue'
      isLoading={isLoading}
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
            onChange={setSelectedChains}
            placeholder='Chain'
            disabled={isLoading}
          />
          <MultiSelect
            options={marketOptions || []}
            value={selectedMarkets}
            onChange={setSelectedMarkets}
            placeholder='Market'
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
      </div>

      {isLoading && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            Loading...
          </Text>
        </div>
      )}
      {isError && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            Error loading data.
          </Text>
        </div>
      )}
      {!isLoading && !isError && hasData && (
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
      {!isLoading && !isError && !hasData && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            {noDataMessage}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default CompoundCumulativeRevenue;
