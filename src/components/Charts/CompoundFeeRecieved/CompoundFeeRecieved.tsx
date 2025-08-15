import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

const formatValue = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
};

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
  groupBy: string;
  barCount?: number;
  barSize?: 'D' | 'W' | 'M';
  onVisibleBarsChange?: (count: number) => void;
  className?: string;
}

const CompoundFeeRecieved: React.FC<CompoundFeeRecievedProps> = ({
  data = [],
  groupBy,
  barCount = 90,
  barSize = 'D',
  onVisibleBarsChange,
  className
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);
  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState(false);

  useEffect(() => {
    setAreAllSeriesHidden(false);
  }, [data]);

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

    const finalSeries = Array.from(activeSeriesKeys).map(
      (key): Highcharts.SeriesColumnOptions => ({
        type: 'column',
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

  const handleSelectAll = useCallback(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chart.series.forEach((s) => s.setVisible(true, false));
    chart.redraw();
    setAreAllSeriesHidden(false);
  }, []);

  const handleDeselectAll = useCallback(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chart.series.forEach((s) => s.setVisible(false, false));
    chart.redraw();
    setAreAllSeriesHidden(true);
  }, []);

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
        setExtremes: function (e) {
          if (programmaticChange.current) {
            programmaticChange.current = false;
            return;
          }

          if (e.trigger === 'zoom') {
            return;
          }

          const visibleCount = Math.round(
            aggregatedData.filter(
              (point) =>
                point.x >= (e.min || 0) && point.x <= (e.max || Infinity)
            ).length
          );

          onVisibleBarsChange?.(visibleCount);
        }
      }
    },
    yAxis: {
      title: { text: undefined },
      gridLineWidth: 0,
      labels: {
        style: {
          fontSize: '11px',
          color: '#7A8A99',
          fontFamily: 'Haas Grot Text R, sans-serif'
        },
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
      layout: 'horizontal',
      useHTML: true,
      itemStyle: {
        color: '#7A8A99',
        fontSize: '11px',
        fontWeight: '400',
        textDecoration: 'none',
        lineHeight: '100%',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      itemHoverStyle: {
        color: 'var(--color-primary-11)',
        textDecoration: 'none',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      itemHiddenStyle: {
        color: '#4B5563',
        textDecoration: 'line-through',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      symbolWidth: 0,
      symbolHeight: 0,
      itemDistance: 20,
      maxHeight: 100,
      labelFormatter: function () {
        const series = this as Highcharts.Series;
        const textDecoration = series.visible ? 'none' : 'line-through';
        const textColor = series.visible
          ? 'var(--color-primary-11)'
          : '#4B5563';
        return `<span style="display: inline-flex; align-items: center; gap: 8px;">
      <span style="width: 12px; height: 2px; background-color: ${series.color}; display: inline-block; border-radius: 1px; opacity: ${series.visible ? '1' : '0.5'};"></span>
      <span style="font-size: 11px; text-decoration: ${textDecoration}; color: ${textColor}; font-family: 'Haas Grot Text R', sans-serif;">${series.name}</span>
    </span>`;
      },
      navigation: {
        enabled: true,
        arrowSize: 11,
        activeColor: theme === 'light' ? '#17212B' : '#FFFFFF',
        inactiveColor: '#7A899A',
        animation: { duration: 250 },
        style: {
          cursor: 'pointer',
          color: theme === 'light' ? '#17212B' : '#FFFFFF'
        }
      }
    },
    plotOptions: {
      column: {
        pointPadding: 0.05,
        groupPadding: 0.05,
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
        },
        events: {
          legendItemClick: function (this: Highcharts.Series): boolean {
            const chart = this.chart;
            const isAnyOtherSeriesVisible = chart.series.some(
              (s) => s !== this && s.visible
            );
            if (!this.visible && !isAnyOtherSeriesVisible) {
              chart.series.forEach((s) => s.setVisible(s === this, false));
              chart.redraw();
              setAreAllSeriesHidden(false);
              return false;
            }
            setTimeout(() => {
              const isAnySeriesVisibleAfterClick = chart.series.some(
                (s) => s.visible
              );
              setAreAllSeriesHidden(!isAnySeriesVisibleAfterClick);
            }, 0);
            return true;
          }
        }
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
        const header = `<div style="font-weight: 500; margin-bottom: 8px; font-size: 12px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.dateFormat('%B %e, %Y', this.x as number)}</div>`;
        if (groupBy === 'none') {
          const point = this.points?.find((p) => p.series.type === 'area');
          if (!point) return '';
          return `${header}<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 8px; height: 8px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 500; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">$${Highcharts.numberFormat(point.y ?? 0, 0, '.', ',')}</span></div>`;
        }
        const dataPoints = (this.points || []).filter(
          (p) => p.series.type !== 'scatter'
        );
        const sortedPoints = [...dataPoints].sort(
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
                (point) =>
                  `<div style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; margin-bottom: 4px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="white-space: nowrap; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span><span style="font-weight: 500; text-align: right; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(point.y ?? 0)}</span></div>`
              )
              .join('');
          body = `<div style="display: flex; gap: 24px;"><div style="display: flex; flex-direction: column;">${renderColumn(col1Points)}</div><div style="display: flex; flex-direction: column;">${renderColumn(col2Points)}</div></div>`;
        } else {
          body = sortedPoints
            .map(
              (point) =>
                `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 500; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(point.y ?? 0)}</span></div>`
            )
            .join('');
        }
        const footer = `<div style=" padding-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px;"><span style="font-weight: 500; font-size: 12px; font-family: 'Haas Grot Text R', sans-serif;">Total</span><span style="font-weight: 500; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(total)}</span></div>`;
        return header + body + footer;
      }
    },
    series: seriesData,
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    rangeSelector: { enabled: false }
  };

  return (
    <div className={cn('highcharts-container flex h-full flex-col', className)}>
      <div className='relative flex-grow'>
        {areAllSeriesHidden && (
          <Text
            size='11'
            className='text-primary-14 absolute inset-0 flex -translate-y-10 transform items-center justify-center'
          >
            All series are hidden
          </Text>
        )}
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
      <div className='hidden shrink-0 items-center justify-center gap-4 py-2 md:flex'>
        {seriesData.length > 1 && (
          <Button
            onClick={areAllSeriesHidden ? handleSelectAll : handleDeselectAll}
            className='text-primary-14 cursor-pointer rounded-md border border-[color:var(--color-primary-16)] px-2 py-1 text-[12px] hover:border-[color:var(--color-primary-14)]'
          >
            {areAllSeriesHidden ? 'Select All' : 'Unselect All'}
          </Button>
        )}
      </div>
      <div className='absolute right-6 block md:hidden'>
        <div className='flex items-center gap-3'>
          <View.Condition if={Boolean(seriesData.length > 1)}>
            <div
              className={cn(
                'outline-secondary-18 rounded-lg p-1 opacity-50 outline-[0.25px]',
                {
                  'opacity-100': areAllSeriesHidden
                }
              )}
              onClick={areAllSeriesHidden ? handleSelectAll : handleDeselectAll}
            >
              <Icon
                name='eye'
                className='h-6 w-6'
              />
            </div>
          </View.Condition>
        </div>
      </div>
    </div>
  );
};

export default CompoundFeeRecieved;
