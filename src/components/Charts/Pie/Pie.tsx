import React, { FC, useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { useMediaWidth } from '@/shared/hooks/useMediaWidth';
import { cn } from '@/shared/lib/classNames/classNames';
import { colorPicker } from '@/shared/lib/utils/utils';
import Text from '@/shared/ui/Text/Text';

interface PieDataItem {
  name: string;
  percent: number;
  value: string;
  color?: string;
}

interface PieChartProps {
  data: PieDataItem[];

  isResponse?: boolean;

  responseOptions?: Highcharts.ResponsiveOptions;

  className?: string;
}

const PieChart: FC<PieChartProps> = ({
  data,
  isResponse = true,
  className,
  responseOptions
}) => {
  const { theme } = useTheme();

  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const { width } = useMediaWidth();

  useMemo(() => {
    setHiddenItems(new Set());
  }, [data]);

  const legendItemWidth =
    width <= 1116 ? Math.floor((width - 40) / 3) : undefined;

  const legendNavigation = useMemo<Highcharts.LegendNavigationOptions>(() => {
    if (width <= 1116) {
      return { enabled: false };
    }
    return {
      animation: true,
      arrowSize: 11,
      activeColor: theme === 'light' ? '#17212B' : '#FFFFFF',
      inactiveColor: '#7A899A',
      style: {
        cursor: 'pointer',
        color: theme === 'light' ? '#17212B' : '#FFFFFF'
      }
    };
  }, [width, theme]);

  const chartData = useMemo(() => {
    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));
    const totalVisiblePercent = visibleItems.reduce(
      (sum, item) => sum + item.percent,
      0
    );

    return data.map((el, index) => {
      const isVisible = !hiddenItems.has(el.name);
      const newPercent =
        isVisible && totalVisiblePercent > 0
          ? (el.percent / totalVisiblePercent) * 100
          : 0;

      return {
        name: el.name,
        y: newPercent,
        value: el.value,
        color: el.color || colorPicker(index),
        visible: isVisible
      };
    });
  }, [data, hiddenItems]);

  const areAllSeriesHidden = useMemo(() => {
    if (!data || data.length === 0) {
      return false;
    }
    return hiddenItems.size === data.length;
  }, [data, hiddenItems]);

  const shouldShowNoDataMessage = useMemo(() => {
    if (!data || data.length === 0) {
      return true;
    }

    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));

    return (
      visibleItems.length === 0 ||
      visibleItems.every((item) => item.percent === 0)
    );
  }, [data, hiddenItems]);

  const handleLegendItemClick = (itemName: string) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const response: Highcharts.ResponsiveOptions = {
    rules: [
      {
        condition: { maxWidth: 1116 },
        chartOptions: {
          chart: {
            spacingRight: 100
          },
          plotOptions: {
            pie: {
              center: ['42%', '50%']
            }
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
          }
        }
      }
    ],
    ...responseOptions
  };

  const options: Highcharts.Options = {
    chart: {
      plotBackgroundColor: undefined,
      plotBorderWidth: undefined,
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
        fontFamily: 'Haas Grot Text R, sans-serif',
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0'
      },
      headerFormat: `
        <div style="
          font-weight: 500;
          margin-bottom: 16px;
          font-family: 'Haas Grot Text R', sans-serif;
        ">
          {point.name}
        </div>
      `,
      pointFormat: `
        <div style="display: flex; gap: 24px; align-items: center; justify-content: space-between; font-family: 'Haas Grot Text R', sans-serif;">
          <div style="font-weight: 400;">
            {point.y:.1f}%
          </div>
          <div style="font-weight: 400;">
            {point.value}
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
        borderColor: undefined,
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
            legendItemClick: function (this: Highcharts.Point): boolean {
              handleLegendItemClick(this.name);
              return false;
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
      itemWidth: legendItemWidth,
      itemStyle: {
        color: '#7A8A99',
        fontSize: '11px',
        fontWeight: '400',
        lineHeight: '100%',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      itemHoverStyle: {
        color: theme === 'light' ? '#17212B' : '#FFFFFF',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      maxHeight: 100,
      navigation: legendNavigation
    },
    series: [
      {
        type: 'pie',
        borderWidth: 0,
        data: chartData as unknown as Highcharts.PointOptionsObject[]
      }
    ],
    responsive: isResponse ? { ...response } : undefined
  };

  return (
    <div className={cn('highcharts-container relative', className)}>
      {areAllSeriesHidden && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        >
          All series are hidden
        </Text>
      )}
      {!areAllSeriesHidden && shouldShowNoDataMessage && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        >
          All visible values are zero
        </Text>
      )}
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default PieChart;
