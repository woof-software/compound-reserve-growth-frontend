import { useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { aggregateByBarSize } from '@/shared/lib/utils/chart';
import {
  capitalizeFirstLetter,
  getStableColorForSeries
} from '@/shared/lib/utils/utils';

export interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

export interface AggregatedPoint {
  x: number;
  [key: string]: number;
}

interface CompoundReceivedBarProps {
  data: StackedChartData[];
  barSize: 'D' | 'W' | 'M';
  customBarColor?: string;
}

const useCompoundChartBars = ({
  data,
  barSize,
  customBarColor
}: CompoundReceivedBarProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState<boolean>(false);

  const [hiddenItems, setHiddenItems] = useState<string[]>([]);

  const { seriesData, aggregatedData, aggregatedSeries } = useMemo(() => {
    if (!data || data.length === 0) {
      return { seriesData: [], aggregatedData: [], aggregatedSeries: [] };
    }

    // collect all non-date keys (these will become series)
    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'date') {
          allKeys.add(key);
        }
      });
    });

    const allSeriesNames = Array.from(allKeys);

    // build raw per-key series (array of {x: timestamp, y: value})
    const rawSeriesMap = new Map<string, { x: number; y: number }[]>();

    allSeriesNames.forEach((key) => {
      const points = data.map((row) => ({
        x: new Date(row.date).getTime(),
        y: Number((row[key] as number) || 0)
      }));
      rawSeriesMap.set(key, points);
    });

    // Always use aggregateByBarSize (filterForRange removed)
    const effectiveRange = barSize ?? 'D';

    const aggregatedSeries = allSeriesNames.map((name) => {
      const raw = rawSeriesMap.get(name) || [];

      const seriesData = aggregateByBarSize({
        data: raw,
        getDate: ({ x }) => new Date(x),
        transform: ({ x, y }) => [x, y],
        range: effectiveRange
      });

      return {
        data: seriesData,
        id: name,
        type: 'column' as const,
        name: capitalizeFirstLetter(name),
        color: customBarColor ?? getStableColorForSeries(name, allSeriesNames)
      } as Highcharts.SeriesColumnOptions;
    });

    // build aggregatedData: sum of all series per timestamp
    const totalsMap = new Map<number, AggregatedPoint>();

    aggregatedSeries.forEach((sr) => {
      (sr.data || []).forEach((p: any) => {
        let x: number;
        let y: number;

        if (Array.isArray(p)) {
          x = Number(p[0]);
          y = Number(p[1]) || 0;
        } else if (p && typeof p === 'object') {
          x = Number(p.x);
          y = Number(p.y) || 0;
        } else {
          return;
        }

        if (!totalsMap.has(x)) {
          totalsMap.set(x, { x });
        }

        const entry = totalsMap.get(x)!;
        entry['total'] = (entry['total'] || 0) + y;
      });
    });

    const sortedAggregated = Array.from(totalsMap.values()).sort(
      (a, b) => a.x - b.x
    );

    return {
      seriesData: aggregatedSeries,
      aggregatedData: sortedAggregated,
      aggregatedSeries
    };
  }, [data, barSize]);

  const toggleSeriesByName = useCallback((name: string) => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    const targetSeries = chart.series.find((sr) => sr.name === name);

    if (!targetSeries) return;

    targetSeries.setVisible(!targetSeries.visible, false);

    chart.redraw();

    setHiddenItems((prev) => {
      const has = prev.includes(name);
      if (has) {
        return prev.filter((n) => n !== name);
      }

      return [...prev, name];
    });
  }, []);

  const onSelectAll = useCallback(() => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => s.setVisible(true, false));
    chart.redraw();

    setHiddenItems([]);
    setAreAllSeriesHidden(false);
  }, []);

  const onDeselectAll = useCallback(() => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => s.setVisible(false, false));
    chart.redraw();

    const allNames = chart.series.map((s) => s.name as string);
    setHiddenItems(allNames);

    setAreAllSeriesHidden(true);
  }, []);

  return {
    chartRef,
    seriesData,
    aggregatedData,
    aggregatedSeries,
    areAllSeriesHidden,
    hiddenItems,
    toggleSeriesByName,
    setHiddenItems,
    setAreAllSeriesHidden,
    onSelectAll,
    onDeselectAll
  };
};

export { useCompoundChartBars };
