import React, { FC } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';
import { colorPicker } from '@/shared/lib/utils/utils';

interface PieDataItem {
  name: string;
  percent: number;
  value: string;
  color?: string;
}

interface PieChartProps {
  data: PieDataItem[];
  className?: string;
}

const PieChart: FC<PieChartProps> = ({ data, className }) => {
  const { theme } = useTheme();

  const dataLegends = data.map((el, index) => ({
    name: el.name,
    y: el.percent,
    value: el.value,
    color: el.color || colorPicker(index)
  }));

  const options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    credits: {
      enabled: false
    },
    title: {
      text: ''
    },
    tooltip: {
      useHTML: true,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      shadow: {
        color: '#0000000A',
        offsetX: 6,
        offsetY: 0,
        opacity: 1,
        width: 12
      },
      style: {
        fontFamily: 'Haas Grot Text R',
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0'
      },
      headerFormat: `
        <div style="
          font-weight: 500;
          margin-bottom: 16px;
        ">
          {point.name}
        </div>
      `,
      pointFormat: `
        <div style="display: flex; gap: 24px; align-items: center; justify-content: space-between;">
          <div style="font-weight: 400;">
            {point.value}
          </div>
          
          <div style="font-weight: 400;">
            {point.y}%
          </div>
        </div>
      `
    },
    plotOptions: {
      pie: {
        innerSize: '70%',
        allowPointSelect: false,
        cursor: 'default',
        enableMouseTracking: true,
        borderWidth: 0,
        borderRadius: 0,
        borderColor: null,
        states: {
          hover: {
            enabled: true,
            shadow: false,
            halo: {
              size: 0
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        showInLegend: true,
        point: {
          events: {
            click: function () {
              // no-op
            }
          }
        }
      }
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      symbolHeight: 12,
      symbolWidth: 12,
      symbolRadius: 3,
      symbolPadding: 6,
      itemStyle: {
        color: '#7A8A99',
        fontSize: '11px',
        fontWeight: '400',
        lineHeight: '100%'
      },
      itemHoverStyle: {
        color: theme === 'light' ? '#17212B' : '#FFFFFF'
      },
      scrollable: true,
      maxHeight: 100,
      navigation: {
        animation: true,
        arrowSize: 11,
        activeColor: theme === 'light' ? '#17212B' : '#FFFFFF',
        inactiveColor: '#7A899A',
        style: {
          cursor: 'pointer',
          color: theme === 'light' ? '#17212B' : '#FFFFFF'
        }
      }
    },
    series: [
      {
        colorByPoint: true,
        borderWidth: 0,
        data: dataLegends
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

export default PieChart;
