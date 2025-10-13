import { useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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

  barSize?: 'D' | 'W' | 'M';
}

const useCompoundReceivedBars = ({
  data,
  barSize
}: CompoundReceivedBarProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState<boolean>(false);

  const [hiddenItems, setHiddenItems] = useState<string[]>([]);

  const { seriesData, aggregatedData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { seriesData: [], aggregatedData: [] };
    }

    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'date') {
          allKeys.add(key);
        }
      });
    });

    const aggregated = new Map<number, AggregatedPoint>();

    data.forEach((item) => {
      const date = new Date(item.date);
      let keyDate: Date;

      switch (barSize) {
        case 'D': {
          keyDate = new Date(
            Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate()
            )
          );
          break;
        }
        case 'W': {
          const day = date.getUTCDay();
          const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
          keyDate = new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff)
          );
          break;
        }
        case 'M': {
          keyDate = new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
          );
          break;
        }
        default:
          keyDate = date;
      }

      const keyTimestamp = keyDate.getTime();

      if (!aggregated.has(keyTimestamp)) {
        aggregated.set(keyTimestamp, { x: keyTimestamp });
      }

      const aggregatedPoint = aggregated.get(keyTimestamp)!;

      allKeys.forEach((key) => {
        const value = (item[key] as number) || 0;
        aggregatedPoint[key] = (aggregatedPoint[key] || 0) + value;
      });
    });

    const sortedAggregated = Array.from(aggregated.values()).sort(
      (a, b) => a.x - b.x
    );

    const activeSeriesKeys = new Set<string>();
    sortedAggregated.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== 'x' && point[key] !== 0) {
          activeSeriesKeys.add(key);
        }
      });
    });

    const palette = Highcharts.getOptions().colors || [];

    const finalSeries = Array.from(activeSeriesKeys).map(
      (key, idx): Highcharts.SeriesColumnOptions => ({
        type: 'column',
        color: palette[idx % palette.length],
        name: key.charAt(0).toUpperCase() + key.slice(1),
        data: sortedAggregated.map((item) => [
          item.x,
          (item[key] as number) || 0
        ]),
        showInLegend: true
      })
    );

    return { seriesData: finalSeries, aggregatedData: sortedAggregated };
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
    areAllSeriesHidden,
    hiddenItems,

    toggleSeriesByName,
    setHiddenItems,
    setAreAllSeriesHidden,
    onSelectAll,
    onDeselectAll
  };
};

export { useCompoundReceivedBars };
