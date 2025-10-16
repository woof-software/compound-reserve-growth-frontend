import { useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState<boolean>(false);

  const [showEvents, setShowEvents] = useState<boolean>(true);

  const [eventsData, setEventsData] = useState<EventDataItem[]>([]);

  const aggregatedSeries = useMemo<Highcharts.SeriesAreaOptions[]>(() => {
    const allSeriesNames = data.map((series) => series.name);

    return data.map((series) => {
      const seriesData = isAggregate
        ? aggregateByBarSize({
            data: series.data,
            getDate: ({ x }) => new Date(x),
            transform: ({ x, y }) => [x, y],
            range: barSize
          })
        : filterForRange({
            data: series.data,
            getDate: ({ x }) => new Date(x),
            transform: ({ x, y }) => [x, y],
            range: barSize
          });

      return {
        data: seriesData,
        id: series.name,
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        color: getStableColorForSeries(series.name, allSeriesNames)
      };
    });
  }, [data, barSize]);

  const isLegendEnabled = useMemo(
    () => (showLegend ?? groupBy !== 'none') && aggregatedSeries.length > 0,
    [aggregatedSeries.length, groupBy, showLegend]
  );

  const onAllSeriesHidden = (value: boolean) => setAreAllSeriesHidden(value);

  const onShowEvents = (value: boolean) => setShowEvents(value);

  const onEventsData = (value: EventDataItem[]) => setEventsData(value);

  const onSelectAll = useCallback(() => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => s.setVisible(true, false));
    chart.redraw();
  }, []);

  const onDeselectAll = useCallback(() => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => s.setVisible(false, false));
    chart.redraw();
  }, []);

  return {
    chartRef,
    eventsData,
    showEvents,
    areAllSeriesHidden,
    isLegendEnabled,
    aggregatedSeries,

    onEventsData,
    onAllSeriesHidden,
    onShowEvents,
    onSelectAll,
    onDeselectAll
  };
};

export { useLineChart };
