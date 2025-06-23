import React, { FC } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';

interface PieDataItem {
  name: string;
  y: number;
  color?: string;
}

interface PieChartProps {
  data: PieDataItem[];

  className?: string;
}

const PieChart: FC<PieChartProps> = ({ data, className }) => {
  const { theme } = useTheme();

  const dataLegends = data.map((el) => ({
    name: el.name,
    y: el.y,
    color: el.color
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
      pointFormat: '<b>{point.percentage:.0f}%</b>'
    },
    plotOptions: {
      pie: {
        innerSize: '70%',
        allowPointSelect: true,
        cursor: 'pointer',
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
        showInLegend: true
      }
    },
    legend: {
      enabled: true,
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
