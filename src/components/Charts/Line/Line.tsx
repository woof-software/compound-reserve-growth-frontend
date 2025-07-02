import React, { FC, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface LineDataItem {
  x: number;
  y: number;
}

export interface LineChartSeries {
  name: string;
  data: LineDataItem[];
}

interface LineChartProps {
  data: LineChartSeries[];
  groupBy: string;
  className?: string;
  barSize: 'D' | 'W' | 'M';
  barCountToSet: number;
  onVisibleBarsChange: (count: number) => void;
  showLegend?: boolean;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatValue = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
};

const LineChart: FC<LineChartProps> = ({
  data,
  groupBy,
  className,
  barSize,
  barCountToSet,
  onVisibleBarsChange,
  showLegend
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);

  const MAX_VISIBLE_POINTS = 180;

  const aggregatedSeries = useMemo(() => {
    const pointsPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = pointsPerBar[barSize];
    return data.map((series) => {
      const result: [number, number][] = [];
      for (let i = 0; i < series.data?.length; i += chunkSize) {
        const chunk = series.data.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;
        const lastPoint = chunk[chunk.length - 1];
        result.push([lastPoint.x, lastPoint.y]);
      }
      return {
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        data: result
      };
    });
  }, [data, barSize]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    const currentSeriesCount = chart.series.length;
    const newSeriesCount = aggregatedSeries.length;

    if (currentSeriesCount !== newSeriesCount) {
      while (chart.series.length > 0) {
        chart.series[0].remove(false);
      }
      aggregatedSeries.forEach((s) => chart.addSeries(s, false));
    } else {
      aggregatedSeries.forEach((s, i) => {
        if (chart.series[i]) {
          chart.series[i].update(s, false);
        }
      });
    }

    chart.redraw();
  }, [aggregatedSeries, groupBy]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart || !barCountToSet) return;

    if (aggregatedSeries[0]?.data.length > 0) {
      const dataLength = aggregatedSeries[0].data.length;
      const startIndex = Math.max(0, dataLength - barCountToSet);

      if (startIndex < dataLength) {
        const min = aggregatedSeries[0].data[startIndex][0];
        const max = aggregatedSeries[0].data[dataLength - 1][0];
        programmaticChange.current = true;
        chart.xAxis[0].setExtremes(min, max, true);
      }
    }
  }, [barCountToSet, aggregatedSeries]);

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

  const isLegendEnabled = showLegend ?? groupBy !== 'none';

  const options: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      plotBorderWidth: 0,
      plotShadow: false,
      animation: false,
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
    credits: { enabled: false },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 0,
      labels: {
        format: xAxisLabelFormat,
        style: { color: '#7A8A99', fontSize: '11px' }
      },
      lineColor: theme === 'light' ? '#E6E6E6' : '#2A2A2A',
      tickColor: theme === 'light' ? '#E6E6E6' : '#2A2A2A',
      crosshair: { width: 1, color: '#7A8A99', dashStyle: 'Dash' },
      events: {
        setExtremes: function (e) {
          if (programmaticChange.current) {
            programmaticChange.current = false;
            return;
          }
          const firstSeriesData = aggregatedSeries[0]?.data || [];
          const visibleCount = Math.round(
            firstSeriesData.filter(
              (point) => point[0] >= e.min && point[0] <= e.max
            ).length
          );
          if (visibleCount > MAX_VISIBLE_POINTS) {
            onVisibleBarsChange(MAX_VISIBLE_POINTS);
            return false;
          }
          onVisibleBarsChange(visibleCount);
        }
      }
    },
    yAxis: {
      title: { text: '' },
      gridLineWidth: 0,
      labels: {
        style: { color: '#7A8A99', fontSize: '11px' },
        formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
          const val = Number(this.value);
          if (isNaN(val)) return this.value.toString();
          if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
          if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
          if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
          return val.toString();
        }
      },
      gridLineColor:
        theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)'
    },
    tooltip: {
      useHTML: true,
      backgroundColor: 'rgba(18, 24, 47, 0.55)',
      borderWidth: 0,
      shadow: false,
      borderRadius: 8,
      padding: 12,
      style: {
        color: '#FFFFFF',
        fontFamily: 'Haas Grot Text R'
      },
      shared: true,
      formatter: function () {
        const header = `<div style="font-weight: 500; margin-bottom: 8px; font-size: 12px;">${Highcharts.dateFormat(
          '%B %e, %Y',
          this.x as number
        )}</div>`;

        if (groupBy === 'none') {
          const point = this.points?.[0];
          if (!point) return '';
          return `
            ${header}
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background-color:${
                  point.series.color
                }; width: 8px; height: 8px; display: inline-block; border-radius: 2px;"></span>
                <span style="font-size: 11px;">${point.series.name}</span>
              </div>
              <span style="font-weight: 500; font-size: 11px;">$${Highcharts.numberFormat(
                point.y ?? 0,
                0,
                '.',
                ','
              )}</span>
            </div>`;
        }

        const sortedPoints = [...(this.points || [])].sort(
          (a, b) => (b.y ?? 0) - (a.y ?? 0)
        );

        let total = 0;
        sortedPoints.forEach((point) => {
          total += point.y ?? 0;
        });

        let body = '';
        if (groupBy === 'Market') {
          const midPoint = Math.ceil(sortedPoints.length / 2);
          const col1Points = sortedPoints.slice(0, midPoint);
          const col2Points = sortedPoints.slice(midPoint);

          const renderColumn = (points: Highcharts.Point[]) =>
            points
              .map(
                (point) => `
                <div style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="background-color:${
                    point.series.color
                  }; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span>
                  <span style="white-space: nowrap; font-size: 11px;">${
                    point.series.name
                  }</span>
                  <span style="font-weight: 500; text-align: right; font-size: 11px;">${formatValue(
                    point.y ?? 0
                  )}</span>
                </div>`
              )
              .join('');

          body = `
            <div style="display: flex; gap: 24px;">
              <div style="display: flex; flex-direction: column;">
                ${renderColumn(col1Points)}
              </div>
              <div style="display: flex; flex-direction: column;">
                ${renderColumn(col2Points)}
              </div>
            </div>`;
        } else {
          body = sortedPoints
            .map(
              (point) => `
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="background-color:${
                    point.series.color
                  }; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span>
                  <span style="font-size: 11px;">${point.series.name}</span>
                </div>
                <span style="font-weight: 500; font-size: 11px;">${formatValue(
                  point.y ?? 0
                )}</span>
              </div>`
            )
            .join('');
        }

        const footer = `
          <div style=" padding-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
            <span style="font-weight: 500; font-size: 12px;">Total</span>
            <span style="font-weight: 500; font-size: 11px;">${formatValue(
              total
            )}</span>
          </div>`;

        return header + body + footer;
      }
    },
    legend: {
      enabled: isLegendEnabled,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      symbolRadius: 0,
      symbolWidth: 10,
      symbolHeight: 10,
      itemStyle: {
        color: theme === 'light' ? '#000' : '#FFF',
        fontWeight: 'normal'
      },
      itemHoverStyle: {
        color: theme === 'light' ? '#555' : '#DDD'
      }
    },
    plotOptions: {
      area: {
        lineWidth: 2,
        marker: {
          enabled: false,
          symbol: 'circle',
          states: {
            hover: {
              enabled: true,
              radius: 3
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0
          }
        },
        threshold: null,
        fillOpacity: 0.1,
        stacking: 'normal'
      }
    },
    series: aggregatedSeries.map((series) => ({
      type: 'area',
      name: series.name,
      data: series.data
    })),
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    rangeSelector: { enabled: false }
  };

  return (
    <div className={cn('highcharts-container', className)}>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </div>
  );
};

export default LineChart;
