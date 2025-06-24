import React, { FC } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';

interface LineDataItem {
  x: number;

  y: number;
}

interface LineChartProps {
  data: LineDataItem[];

  className?: string;
}

const LineChart: FC<LineChartProps> = ({ data, className }) => {
  const { theme } = useTheme();

  const options: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      plotBorderWidth: 0,
      plotShadow: false
    },

    credits: { enabled: false },
    title: { text: '' },

    xAxis: {
      type: 'datetime',
      gridLineWidth: 0,

      labels: {
        format: "{value:%b '%y}",
        style: { color: '#7A8A99', fontSize: '11px' }
      },

      lineColor: theme === 'light' ? '#E6E6E6' : '#2A2A2A',
      tickColor: theme === 'light' ? '#E6E6E6' : '#2A2A2A'
    },

    yAxis: {
      title: { text: '' },
      gridLineWidth: 0,

      labels: {
        style: { color: '#7A8A99', fontSize: '11px' },
        formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
          // приводим значение к number
          const val =
            typeof this.value === 'string'
              ? parseFloat(this.value)
              : (this.value as number);

          // теперь безопасно сравнивать
          return val >= 1e6 ? `${(val / 1e6).toFixed(0)}M` : val.toString();
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
        marker: { enabled: false },
        states: { hover: { lineWidth: 3 } },
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
        name: '',
        showInLegend: false,
        data,
        color: '#00C289'
      }
    ]
  };

  return (
    <div className={cn('highcharts-container', className)}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default LineChart;
