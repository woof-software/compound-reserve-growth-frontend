import React, { useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { networkColorMap } from '@/shared/lib/utils/utils';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

interface AggregatedPoint {
  x: number;
  [key: string]: number;
}

interface CompoundFeeRecievedProps {
  data: StackedChartData[];
  barCount?: number;
  barSize?: 'D' | 'W' | 'M';
  onVisibleBarsChange?: (count: number) => void;
}

const CompoundFeeRecieved: React.FC<CompoundFeeRecievedProps> = ({
  data = [],
  barCount = 90,
  barSize = 'D',
  onVisibleBarsChange
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);
  const MAX_VISIBLE_BARS = 180;

  const dynamicSeriesConfig = useMemo(() => {
    if (!data || data.length === 0) return [];

    const seriesKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'date') {
          seriesKeys.add(key);
        }
      });
    });

    return Array.from(seriesKeys).map((key) => ({
      key: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      color: networkColorMap[key.toLowerCase()] || '#808080'
    }));
  }, [data]);

  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const pointsPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = pointsPerBar[barSize];
    const result: AggregatedPoint[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;

      const lastPointDate = new Date(chunk[chunk.length - 1].date);

      const timestamp =
        barSize === 'M'
          ? new Date(
              lastPointDate.getFullYear(),
              lastPointDate.getMonth(),
              1
            ).getTime()
          : lastPointDate.getTime();

      const aggregatedPoint: AggregatedPoint = { x: timestamp };

      dynamicSeriesConfig.forEach((config) => {
        aggregatedPoint[config.key] = 0;
      });

      chunk.forEach((dailyData) => {
        dynamicSeriesConfig.forEach((config) => {
          (aggregatedPoint[config.key] as number) +=
            (dailyData[config.key] as number) || 0;
        });
      });
      result.push(aggregatedPoint);
    }
    return result;
  }, [data, barSize, dynamicSeriesConfig]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart || !barCount || aggregatedData.length === 0) return;

    const dataLength = aggregatedData.length;
    const startIndex = Math.max(0, dataLength - barCount);

    if (startIndex < dataLength) {
      const min = aggregatedData[startIndex].x;
      const max = aggregatedData[dataLength - 1].x;
      programmaticChange.current = true;
      chart.xAxis[0].setExtremes(min, max, true);
    }
  }, [barCount, aggregatedData]);

  let xAxisLabelFormat: string;
  switch (barSize) {
    case 'D':
    case 'W':
      xAxisLabelFormat = '{value:%b %d}';
      break;
    case 'M':
    default:
      xAxisLabelFormat = "{value:%b '%y}";
      break;
  }

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      animation: true,
      backgroundColor: 'transparent',
      panning: { enabled: true, type: 'x' },
      zooming: {
        mouseWheel: {
          enabled: true,
          type: 'x',
          sensitivity: 1.1,
          preventDefault: true
        },
        type: undefined,
        pinchType: undefined,
        resetButton: { theme: { display: 'none' } }
      }
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      labels: {
        format: xAxisLabelFormat,
        style: { fontSize: '11px', color: '#7A8A99' }
      },
      lineWidth: 0,
      tickLength: 0,
      tickWidth: 0,
      crosshair: {
        width: 1,
        color: theme === 'light' ? '#A1A1AA' : '#52525b',
        dashStyle: 'ShortDash'
      },
      events: {
        setExtremes: function (e) {
          if (programmaticChange.current) {
            programmaticChange.current = false;
            return;
          }

          const visibleCount = Math.round(
            aggregatedData.filter(
              (point) =>
                point.x >= (e.min || 0) && point.x <= (e.max || Infinity)
            ).length
          );

          if (visibleCount > MAX_VISIBLE_BARS) {
            onVisibleBarsChange?.(MAX_VISIBLE_BARS);
            return false;
          }

          onVisibleBarsChange?.(visibleCount);
        }
      }
    },
    yAxis: {
      title: { text: undefined },
      gridLineWidth: 0,
      labels: {
        style: { fontSize: '11px', color: '#7A8A99' },
        formatter: function () {
          const value = this.value as number;
          if (Math.abs(value) >= 1000000)
            return (value / 1000000).toFixed(0) + 'M';
          if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        }
      },
      lineWidth: 0
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        color: '#7A8A99',
        fontSize: '11px',
        fontWeight: '400',
        lineHeight: '100%'
      },
      itemHiddenStyle: {
        color: '#4B5563'
      },
      symbolRadius: 6,
      symbolHeight: 12,
      symbolWidth: 12,
      itemHoverStyle: {
        color: theme === 'light' ? '#17212B' : '#FFFFFF'
      }
    },
    plotOptions: {
      column: {
        pointPadding: 0.1,
        groupPadding: 0.1,
        borderWidth: 0,
        states: { hover: { animation: false }, inactive: { opacity: 1 } }
      },
      series: {
        animation: { duration: 500 },
        stickyTracking: true,
        findNearestPointBy: 'x',
        cursor: 'pointer',
        enableMouseTracking: true,
        states: {
          inactive: {
            opacity: 1
          }
        }
      }
    },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: 'rgba(18, 24, 47, 0.55)',
      borderColor: 'rgba(75, 85, 99, 0.5)',
      borderRadius: 8,
      borderWidth: 1,
      style: { color: '#FFFFFF', fontSize: '12px' },
      shared: true,
      useHTML: true,
      shadow: true,
      followPointer: false,
      padding: 12,
      formatter: function () {
        const points = this.points;
        if (!points || points.length === 0) return '';

        const header = `<div style="font-weight: 600; font-size: 12px; margin-bottom: 8px; color: #E5E7EB;">${Highcharts.dateFormat('%B %e, %Y', this.x as number)}</div>`;

        let tooltip = `<div style="min-width: 200px">${header}`;
        let total = 0;
        const sortedPoints = [...points].sort(
          (a, b) => Math.abs(b.y as number) - Math.abs(a.y as number)
        );
        sortedPoints.forEach((point) => {
          total += point.y as number;
          const value =
            '$' +
            (point.y as number).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
          tooltip += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; background-color: ${point.color}; border-radius: 50%;"></div>
                <span style="color: #E5E7EB; font-size: 11px;">${point.series.name}</span>
              </div>
              <span style="font-weight: 500; font-size: 12px; color: #FFFFFF; font-size: 11px;">${value}</span>
            </div>`;
        });
        const totalFormatted =
          '$' +
          total.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        tooltip += `
          <div style="padding-top: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #E5E7EB; font-weight: 600; font-size: 11px;">Total</span>
              <span style="font-weight: 600; color: #FFFFFF; font-size: 11px;">${totalFormatted}</span>
            </div>
          </div>
        </div>`;
        return tooltip;
      }
    },
    series: dynamicSeriesConfig.map(
      (config): Highcharts.SeriesColumnOptions => ({
        type: 'column',
        name: config.name,
        data: aggregatedData.map((item) => [
          item.x,
          (item[config.key] as number) || 0
        ]),
        color: config.color,
        showInLegend: true
      })
    ),
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    rangeSelector: { enabled: false }
  };

  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{ style: { width: '100%', height: '100%' } }}
    />
  );
};

export default CompoundFeeRecieved;
