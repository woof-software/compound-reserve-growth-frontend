import React, { useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';

import { seriesConfig, StackedChartData, stackedChartData } from '../chartData';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface CompoundFeeRecievedProps {
  data?: StackedChartData[];
  barCount?: number;
  barSize?: 'D' | 'W' | 'M';
  visibleSeriesKeys?: string[];
}

const CompoundFeeRecieved: React.FC<CompoundFeeRecievedProps> = ({
  data = stackedChartData,
  barCount = 90,
  barSize = 'D',
  visibleSeriesKeys = []
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const aggregatedData = useMemo(() => {
    if (!data) return [];

    const daysPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = daysPerBar[barSize];
    const result: StackedChartData[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;

      const aggregatedPoint: StackedChartData = {};
      seriesConfig.forEach((config) => {
        aggregatedPoint[config.key] = 0;
      });

      chunk.forEach((dailyData) => {
        seriesConfig.forEach((config) => {
          (aggregatedPoint[config.key] as number) +=
            (dailyData[config.key] as number) || 0;
        });
      });

      const lastDate = new Date(chunk[chunk.length - 1].date as string);
      let periodLabel = '';

      switch (barSize) {
        case 'D':
        case 'W':
          periodLabel = lastDate.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric'
          });
          break;
        case 'M':
          periodLabel = lastDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short'
          });
          break;
      }
      aggregatedPoint.period = periodLabel;

      result.push(aggregatedPoint);
    }
    return result;
  }, [data, barSize]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart || !aggregatedData || aggregatedData.length === 0) {
      return;
    }

    const dataLength = aggregatedData.length;
    const startIndex = Math.max(0, dataLength - barCount);
    const endIndex = dataLength - 1;

    if (startIndex <= endIndex) {
      chart.xAxis[0].setExtremes(startIndex, endIndex, true, false);
    }
  }, [aggregatedData, barCount]);

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
      categories: aggregatedData.map((item) => item.period || ''),
      labels: {
        style: { fontSize: '11px', color: '#7A8A99' }
      },
      lineWidth: 0,
      tickLength: 0,
      tickWidth: 0,
      crosshair: {
        width: 1,
        color: theme === 'light' ? '#A1A1AA' : '#52525b',
        dashStyle: 'ShortDash'
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
      positioner: function (labelWidth, labelHeight, point) {
        const chart = this.chart;
        const plotLeft = chart.plotLeft,
          plotWidth = chart.plotWidth;
        const plotTop = chart.plotTop,
          plotHeight = chart.plotHeight;
        const x = Math.max(
          10,
          Math.min(
            plotLeft + point.plotX - labelWidth / 2,
            plotLeft + plotWidth - labelWidth - 10
          )
        );
        const y = plotTop + plotHeight - labelHeight - 20;
        return { x, y };
      },
      formatter: function () {
        const points = this.points;
        if (!points || points.length === 0) return '';
        const pointIndex = points[0].index;
        if (typeof pointIndex === 'undefined' || !aggregatedData[pointIndex])
          return '';
        const currentPeriod = aggregatedData[pointIndex].period;
        let tooltip = '<div style="min-width: 200px">';
        tooltip += `<div style="font-weight: 600; font-size: 12px; margin-bottom: 8px; color: #E5E7EB;">Date: ${currentPeriod}</div>`;
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
                <span style="color: #E5E7EB;">${point.series.name}</span>
              </div>
              <span style="font-weight: 500; font-size: 12px; color: #FFFFFF;">${value}</span>
            </div>`;
        });
        const totalFormatted =
          '$' +
          total.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        tooltip += `
          <div style="margin-top: 6px; padding-top: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #E5E7EB; font-weight: 600;">Total</span>
              <span style="font-weight: 600; color: #FFFFFF;">${totalFormatted}</span>
            </div>
          </div>
        </div>`;
        return tooltip;
      }
    },
    series: seriesConfig.map(
      (config): Highcharts.SeriesColumnOptions => ({
        type: 'column',
        name: config.name,
        data: aggregatedData.map((item) => (item[config.key] as number) || 0),
        color: config.color,
        visible:
          visibleSeriesKeys.length === 0 ||
          visibleSeriesKeys.includes(config.key),
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
