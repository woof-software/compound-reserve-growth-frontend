import { useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { LineChartSeries } from '@/components/Charts/Line/Line';
import {
  capitalizeFirstLetter,
  getStableColorForSeries,
  startOfUTCDay,
  startOfUTCMonth,
  startOfUTCWeekMon
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

type XY = [number, number];

function aggregateByBarSize(
  points: { x: number; y: number }[],
  barSize: 'D' | 'W' | 'M'
): XY[] {
  if (!points?.length) return [];

  const sorted = [...points].sort((a, b) => a.x - b.x);

  const bucketFn =
    barSize === 'M'
      ? startOfUTCMonth
      : barSize === 'W'
        ? startOfUTCWeekMon
        : startOfUTCDay;

  const map = new Map<number, number>();

  console.log('map=>', map);
  console.log('sorted=>', sorted);

  for (const p of sorted) {
    const key = bucketFn(p.x);

    map.set(key, (map.get(key) || 0) + (Number.isFinite(p.y) ? p.y : 0));
  }

  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
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

    return data.map((series) => {
      const aggregated = aggregateByBarSize(series.data, barSize);

      return {
        data: aggregated,
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
