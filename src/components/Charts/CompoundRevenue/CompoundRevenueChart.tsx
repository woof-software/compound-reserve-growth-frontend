import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import Highcharts, { Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { AggregatedPoint } from '@/shared/hooks/useCompoundChartBars';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { noop } from '@/shared/lib/utils/utils';
import Icon from '@/shared/ui/Icon/Icon';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface CompoundRevenueChartProps {
  seriesData: Highcharts.SeriesColumnOptions[];
  aggregatedData: AggregatedPoint[];
  chartRef: RefObject<HighchartsReact.RefObject | null>;
  barCount?: number;
  barSize?: 'D' | 'W' | 'M';
  className?: string;
  onVisibleBarsChange?: (count: number) => void;
}

const CompoundRevenueChart: React.FC<CompoundRevenueChartProps> = ({
  chartRef,
  seriesData = [],
  aggregatedData = [],
  barCount = 90,
  barSize = 'D',
  className,
  onVisibleBarsChange = noop
}) => {
  const { theme } = useTheme();
  const programmaticChange = useRef(false);

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

  const defaultTooltipFormatter = useCallback((context: any) => {
    const point = context.points?.[0];
    if (!point) return '';

    const seriesName = point.series.name;
    const color = point.series.color;

    const header = `<div style="font-weight: 500; margin-bottom: 12px; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.dateFormat('%B %e, %Y', context.x as number)}</div>`;

    const body = `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background-color:${color}; width: 14px; height: 14px; display: inline-block; border-radius: 2px;"></span>
                        <span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${seriesName}</span>
                      </div>
                      <span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                        ${Format.price(point.y ?? 0, 'standard')}
                      </span>
                    </div>`;

    return header + body;
  }, []);

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
  }, [barCount, aggregatedData, chartRef]);

  const chartOptions: Options = useMemo(() => {
    return {
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
          style: {
            fontSize: '11px',
            color: '#7A8A99',
            fontFamily: 'Haas Grot Text R, sans-serif'
          }
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
          setExtremes: (e) => {
            if (programmaticChange.current) {
              programmaticChange.current = false;
              return;
            }
            if (e.trigger === 'zoom') return;
            const visibleCount = Math.round(
              aggregatedData.filter(
                (p) => p.x >= (e.min || 0) && p.x <= (e.max || Infinity)
              ).length
            );
            onVisibleBarsChange(visibleCount);
          }
        }
      },
      yAxis: {
        title: { text: undefined },
        gridLineWidth: 1,
        gridLineColor: theme === 'light' ? '#E5E7EA' : '#2B3947',
        gridLineDashStyle: 'Dash',
        labels: {
          style: {
            fontSize: '11px',
            color: '#7A8A99',
            fontFamily: 'Haas Grot Text R, sans-serif'
          },
          formatter: function () {
            return Format.token(this.value, 'compact');
          }
        },
        lineWidth: 0
      },
      legend: { enabled: false },
      plotOptions: {
        column: {
          pointPadding: 0.05,
          groupPadding: 0.05,
          borderWidth: 0,
          states: { hover: { animation: false }, inactive: { opacity: 1 } }
        }
      },
      credits: { enabled: false },
      tooltip: {
        useHTML: true,
        backgroundColor: 'rgba(18, 24, 47, 0.55)',
        borderWidth: 0,
        shadow: false,
        borderRadius: 8,
        padding: 12,
        style: {
          color: 'var(--color-white-10)',
          fontFamily: 'Haas Grot Text R, sans-serif'
        },
        shared: true,
        formatter: function () {
          return defaultTooltipFormatter(this);
        }
      },
      series: seriesData,
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      rangeSelector: { enabled: false }
    };
  }, [
    seriesData,
    theme,
    xAxisLabelFormat,
    aggregatedData,
    onVisibleBarsChange,
    defaultTooltipFormatter
  ]);

  return (
    <div
      className={cn(
        'highcharts-container relative flex h-full flex-col',
        className
      )}
    >
      <div className='relative min-h-[400px] flex-grow'>
        <div className='absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 opacity-40'>
          <Icon
            name='logo-gray'
            className='h-[27px] w-[121px]'
            color='primary-11'
            isRound={false}
          />
        </div>
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{
            style: {
              display: 'block',
              width: '100%',
              height: '100%'
            }
          }}
        />
      </div>
    </div>
  );
};

export default CompoundRevenueChart;
