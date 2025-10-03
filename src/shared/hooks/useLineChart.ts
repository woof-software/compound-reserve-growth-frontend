import { useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { LineChartSeries } from '@/components/Charts/Line/Line';
import {
  capitalizeFirstLetter,
  getStableColorForSeries
} from '@/shared/lib/utils/utils';

interface LineChartProps {
  showLegend?: boolean;

  data: LineChartSeries[];

  groupBy: string;

  barSize: 'D' | 'W' | 'M';
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
  barSize
}: LineChartProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState<boolean>(false);

  const [showEvents, setShowEvents] = useState<boolean>(true);

  const [eventsData, setEventsData] = useState<EventDataItem[]>([]);

  const aggregatedSeries = useMemo<Highcharts.SeriesAreaOptions[]>(() => {
    const allSeriesNames = data.map((series) => series.name);

    console.log('allSeriesNames=>', allSeriesNames);

    if (barSize === 'D') {
      return data.map((series) => ({
        id: series.name,
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        data: series.data.map((d) => [d.x, d.y]),
        color: getStableColorForSeries(series.name, allSeriesNames)
      }));
    }

    return data.map((series) => {
      if (!series.data?.length) {
        return {
          id: series.name,
          type: 'area' as const,
          name: capitalizeFirstLetter(series.name),
          data: [],
          color: getStableColorForSeries(series.name, allSeriesNames)
        };
      }

      const aggregatedPoints = new Map<number, number>();

      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        let periodStartTimestamp: number;

        if (barSize === 'W') {
          const dayOfWeek = date.getUTCDay();
          const diff =
            date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          const startOfWeek = new Date(date);
          startOfWeek.setUTCDate(diff);
          periodStartTimestamp = startOfWeek.getTime();
        } else {
          periodStartTimestamp = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            1
          ).getTime();
        }
        aggregatedPoints.set(periodStartTimestamp, point.y);
      }

      const resultData = Array.from(aggregatedPoints.entries()).map(
        ([timestamp, yValue]) => [timestamp, yValue]
      );

      resultData.sort((a, b) => a[0] - b[0]);

      return {
        id: series.name,
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        data: resultData,
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
    setAreAllSeriesHidden(false);
  }, []);

  const onDeselectAll = useCallback(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chart.series.forEach((s) => s.setVisible(false, false));
    chart.redraw();
    setAreAllSeriesHidden(true);
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
