import { useMemo, useState } from 'react';

import type { LineChartSeries } from '@/components/Charts/Line/Line';
import LineChart from '@/components/Charts/Line/Line';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import { useChartControls } from '@/shared/hooks/useChartControls';
import {
  CompoundCumulativeRevenueItem,
  useCompCumulativeRevenue
} from '@/shared/hooks/useCompCumulativeRevenuets';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const CompoundCumulativeRevenue = () => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);

  const onChainChange = (selectedOptions: OptionType[]) => {
    setSelectedChains(selectedOptions);
  };

  const onMarketChange = (selectedOptions: OptionType[]) => {
    setSelectedMarkets(selectedOptions);
  };

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

  const rawData = useMemo(() => apiResponse?.data?.data || [], [apiResponse]);

  const { chainOptions, marketOptions } = useMemo(() => {
    if (!rawData.length) return { chainOptions: [], marketOptions: [] };

    const chains = new Set<string>();
    const markets = new Set<string>();

    rawData.forEach((item: CompoundCumulativeRevenueItem) => {
      if (item.source?.network) chains.add(item.source.network);
      if (item.source?.market) markets.add(item.source.market);
    });

    const toOptions = (set: Set<string>): OptionType[] =>
      Array.from(set)
        .filter(Boolean)
        .sort()
        .map((value) => ({
          id: value,
          label: capitalizeFirstLetter(value)
        }));

    return {
      chainOptions: toOptions(chains),
      marketOptions: toOptions(markets)
    };
  }, [rawData]);

  const chartSeries: LineChartSeries[] = useMemo(() => {
    if (!rawData.length) return [];

    const selectedChainValues = selectedChains.map((opt) => opt.id);
    const selectedMarketValues = selectedMarkets.map((opt) => opt.id);

    const filteredData = rawData.filter(
      (item: CompoundCumulativeRevenueItem) => {
        const chainMatch =
          selectedChainValues.length === 0 ||
          (item.source.network &&
            selectedChainValues.includes(item.source.network));
        const marketMatch =
          selectedMarketValues.length === 0 ||
          (item.source.market &&
            selectedMarketValues.includes(item.source.market));
        return chainMatch && marketMatch;
      }
    );

    const noFiltersSelected =
      selectedChainValues.length === 0 && selectedMarketValues.length === 0;

    if (noFiltersSelected) {
      const aggregatedByDate = new Map<number, number>();
      filteredData.forEach((item: CompoundCumulativeRevenueItem) => {
        if (item.date && typeof item.value === 'number') {
          const dateKey = item.date * 1000;
          const currentValue = aggregatedByDate.get(dateKey) || 0;
          aggregatedByDate.set(dateKey, currentValue + item.value);
        }
      });

      const formattedData = Array.from(aggregatedByDate.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);

      return [{ name: 'Cumulative Revenue', data: formattedData }];
    } else {
      const groupBy = selectedMarketValues.length > 0 ? 'market' : 'network';
      const aggregatedData = new Map<string, Map<number, number>>();
      filteredData.forEach((item: CompoundCumulativeRevenueItem) => {
        if (!item.date || typeof item.value !== 'number') return;

        const key =
          groupBy === 'market' ? item.source.market : item.source.network;
        const groupName = key || 'Unknown';

        if (!aggregatedData.has(groupName)) {
          aggregatedData.set(groupName, new Map<number, number>());
        }
        const seriesMap = aggregatedData.get(groupName)!;
        const dateKey = item.date * 1000;
        const currentValue = seriesMap.get(dateKey) || 0;
        seriesMap.set(dateKey, currentValue + item.value);
      });

      return Array.from(aggregatedData.entries()).map(([name, dataMap]) => ({
        name: name,
        data: Array.from(dataMap.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x - b.x)
      }));
    }
  }, [rawData, selectedChains, selectedMarkets]);

  const hasData = useMemo(
    () => chartSeries?.some((s) => s.data && s.data.length > 0),
    [chartSeries]
  );

  const noDataMessage =
    selectedChains.length > 0 || selectedMarkets.length > 0
      ? 'No data for selected filters.'
      : 'No data available.';

  const getGroupByForChart = () => {
    const noFiltersSelected =
      selectedChains.length === 0 && selectedMarkets.length === 0;
    if (noFiltersSelected) {
      return 'none';
    }
    return selectedMarkets.length > 0 ? 'Market' : 'Chain';
  };

  return (
    <Card
      title='Compound Cumulative Revenue'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={chainOptions}
            value={selectedChains}
            onChange={onChainChange}
            placeholder='Chain'
            disabled={isLoading}
          />

          <MultiSelect
            options={marketOptions}
            value={selectedMarkets}
            onChange={onMarketChange}
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
          <Text>Loading...</Text>
        </div>
      )}
      {isError && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text>Error loading data.</Text>
        </div>
      )}
      {!isLoading && !isError && hasData && (
        <LineChart
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          onVisibleBarsChange={handleVisibleBarsChange}
          data={chartSeries}
          groupBy={getGroupByForChart()}
          showLegend={false}
        />
      )}
      {!isLoading && !isError && !hasData && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text>{noDataMessage}</Text>
        </div>
      )}
    </Card>
  );
};

export default CompoundCumulativeRevenue;
