import { useMemo } from 'react';

import type { LineChartSeries } from '@/components/Charts/Line/Line';

import {
  capitalizeFirstLetter,
  ChartDataItem,
  getValueByPath
} from '../lib/utils/utils';

interface ChartDataProcessorConfig {
  rawData: ChartDataItem[];
  filters: Record<string, string[]>;
  filterPaths: Record<string, string>;
  groupBy: string;
  groupByKeyPath: string | null;
  defaultSeriesName: string;
}

export const useChartDataProcessor = ({
  rawData,
  filters,
  filterPaths,
  groupBy,
  groupByKeyPath,
  defaultSeriesName
}: ChartDataProcessorConfig): {
  chartSeries: LineChartSeries[];
  hasData: boolean;
} => {
  const chartSeries = useMemo((): LineChartSeries[] => {
    if (!rawData?.length) return [];

    const filteredData = rawData.filter((item) => {
      return Object.entries(filters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = getValueByPath(item, filterPaths[key]);
        return itemValue && selectedValues.includes(itemValue);
      });
    });

    const shouldAggregate = groupBy === 'none' || !groupByKeyPath;

    if (shouldAggregate) {
      const aggregatedByDate = new Map<number, number>();
      filteredData.forEach((item) => {
        if (item.date && typeof item.value === 'number') {
          const dateKey = item.date * 1000;
          const currentValue = aggregatedByDate.get(dateKey) || 0;
          aggregatedByDate.set(dateKey, currentValue + item.value);
        }
      });

      const formattedData = Array.from(aggregatedByDate.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);

      return [{ name: defaultSeriesName, data: formattedData }];
    } else {
      const aggregatedData = new Map<string, Map<number, number>>();
      filteredData.forEach((item) => {
        if (!item.date || typeof item.value !== 'number') return;

        const key = getValueByPath(item, groupByKeyPath) || 'Unknown';

        if (!aggregatedData.has(key)) {
          aggregatedData.set(key, new Map<number, number>());
        }
        const seriesMap = aggregatedData.get(key)!;
        const dateKey = item.date * 1000;
        const currentValue = seriesMap.get(dateKey) || 0;
        seriesMap.set(dateKey, currentValue + item.value);
      });

      return Array.from(aggregatedData.entries()).map(([name, dataMap]) => ({
        name: capitalizeFirstLetter(name),
        data: Array.from(dataMap.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x - b.x)
      }));
    }
  }, [
    rawData,
    filters,
    groupBy,
    groupByKeyPath,
    defaultSeriesName,
    filterPaths
  ]);

  const hasData = useMemo(
    () => chartSeries?.some((s) => s.data && s.data.length > 0),
    [chartSeries]
  );

  return { chartSeries, hasData };
};
