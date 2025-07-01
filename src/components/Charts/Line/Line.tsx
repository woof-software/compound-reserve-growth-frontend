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

interface LineChartProps {
  data: LineDataItem[];
  className?: string;
  barSize: 'D' | 'W' | 'M';
  barCountToSet: number;
  onVisibleBarsChange: (count: number) => void;
}

const LineChart: FC<LineChartProps> = ({
  data,
  className,
  barSize,
  barCountToSet,
  onVisibleBarsChange
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);

  const MAX_VISIBLE_POINTS = 180;

  const aggregatedData = useMemo(() => {
    const pointsPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = pointsPerBar[barSize];
    const result: [number, number][] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;

      const lastPoint = chunk[chunk.length - 1];
      result.push([lastPoint.x, lastPoint.y]);
    }
    return result;
  }, [data, barSize]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart || aggregatedData.length === 0) return;

    chart.series[0].setData(aggregatedData, false);

    if (barCountToSet > 0) {
      const dataLength = aggregatedData.length;
      const startIndex = Math.max(0, dataLength - barCountToSet);

      if (startIndex < dataLength) {
        const min = aggregatedData[startIndex][0];
        const max = aggregatedData[dataLength - 1][0];
        programmaticChange.current = true;
        chart.xAxis[0].setExtremes(min, max, true, false);
      }
    } else {
      chart.redraw();
    }
  }, [aggregatedData, barCountToSet]);

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

          const visibleCount = Math.round(
            aggregatedData.filter(
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
      backgroundColor: '#FFFFFF',
      borderWidth: 0,
      shadow: {
        color: '#0000000A',
        offsetX: 0,
        offsetY: 8,
        opacity: 0.04,
        width: 24
      },
      borderRadius: 8,
      padding: 24,
      style: {
        fontFamily: 'Haas Grot Text R',
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0'
      },
      headerFormat: `
        <div style="
          font-weight: 500;
          margin-bottom: 8px;
        ">
          {point.key:%e %b %Y}
        </div>
      `,
      pointFormat: `
        <div style="
          display: flex;
          justify-content: space-between;
          font-weight: 400;
        ">
          <span>{point.y}</span>
        </div>
      `
    },
    plotOptions: {
      area: {
        lineWidth: 2,
        color: '#00C289',
        marker: { enabled: false, symbol: 'circle', radius: 4 },
        states: {
          hover: {
            lineWidthPlus: 0
          }
        },
        threshold: null,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#00C2891A'],
            [1, '#00C2891A']
          ]
        }
      }
    },
    series: [
      {
        type: 'area',
        name: 'Value',
        showInLegend: false,
        data: aggregatedData,
        color: '#00C289'
      }
    ],
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
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </div>
  );
};

export default LineChart;
