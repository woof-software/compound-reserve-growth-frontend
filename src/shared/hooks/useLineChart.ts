import { useMemo } from 'react';
import Highcharts from 'highcharts';

import { LineChartSeries } from '@/components/Charts/Line/Line';
import { aggregateByBarSize, filterForRange } from '@/shared/lib/utils/chart';
import {
  capitalizeFirstLetter,
  getStableColorForSeries
} from '@/shared/lib/utils/utils';

interface LineChartProps {
  showLegend?: boolean;
  data: LineChartSeries[];
  groupBy: string;
  barSize: 'D' | 'W' | 'M';
  isAggregate?: boolean;
}

export interface EventDataItem {
  x: number;
  title: string;
  text: string;
}

const useLineChart = ({
  showLegend,
  groupBy,
  data,
  barSize,
  isAggregate = false
}: LineChartProps) => {
  const aggregatedSeries = useMemo<Highcharts.SeriesAreaOptions[]>(() => {
    const allSeriesNames = data.map((series) => series.name);

    return data.map((series) => {
      let seriesData: [number, number][];

      if (isAggregate) {
        seriesData = aggregateByBarSize({
          data: series.data,
          getDate: ({ x }) => new Date(x),
          getValue: ({ y }) => y,
          applyValue: ({ x, y }, value) => ({ x, y: y + value }),
          transform: ({ x, y }) => [x, y],
          range: barSize
        });
      } else {
        seriesData = filterForRange({
          data: series.data,
          getDate: ({ x }) => new Date(x),
          transform: ({ x, y }) => [x, y],
          range: barSize
        });
      }

      return {
        data: seriesData,
        id: series.name,
        type: 'area',
        name: capitalizeFirstLetter(series.name),
        color: getStableColorForSeries(series.name, allSeriesNames)
      };
    });
  }, [data, barSize]);

  const isLegendEnabled = useMemo(
    () => (showLegend ?? groupBy !== 'none') && aggregatedSeries.length > 0,
    [aggregatedSeries.length, groupBy, showLegend]
  );

  return {
    isLegendEnabled,
    aggregatedSeries
  };
};

export { useLineChart };
