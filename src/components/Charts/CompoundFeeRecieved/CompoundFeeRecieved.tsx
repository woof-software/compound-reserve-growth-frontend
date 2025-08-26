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
import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Each from '@/shared/ui/Each/Each';
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

  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const viewportRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = viewportRef.current;

    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setCanScrollLeft(scrollLeft > 1);

    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const scrollByDir = (dir: 'left' | 'right') => {
    const el = viewportRef.current;

    if (!el) return;

    const step = Math.max(el.clientWidth * 0.6, 120);

    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  useEffect(() => setAreAllSeriesHidden(false), [data]);

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

    const palette = Highcharts.getOptions().colors || [];

    const finalSeries = Array.from(activeSeriesKeys).map(
      (key, idx): Highcharts.SeriesColumnOptions => ({
        type: 'column',
        color: palette[idx % palette.length],
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

  const highlightSeries = useCallback((name: string) => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => {
      const active = s.name === name && s.visible !== false;

      (s as any).group?.attr({ opacity: active ? 1 : 0.25 });

      (s as any).markerGroup?.attr?.({ opacity: active ? 1 : 0.25 });

      (s as any).dataLabelsGroup?.attr?.({ opacity: active ? 1 : 0.25 });

      if (active) (s as any).group?.toFront();
    });
  }, []);

  const clearHighlight = useCallback(() => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => {
      (s as any).group?.attr({ opacity: 1 });

      (s as any).markerGroup?.attr?.({ opacity: 1 });

      (s as any).dataLabelsGroup?.attr?.({ opacity: 1 });
    });
  }, []);

  const toggleSeriesByName = useCallback((name: string) => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    const s = chart.series.find((sr) => sr.name === name);

    if (!s) return;

    s.setVisible(!s.visible, false);

    chart.redraw();

    setHiddenItems((prev) => {
      const next = new Set(prev);

      if (s.visible) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });

    setTimeout(() => {
      const anyVisible = chart.series.some((sr) => sr.visible);

      setAreAllSeriesHidden(!anyVisible);
    }, 0);
  }, []);

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
          onVisibleBarsChange?.(visibleCount);
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
          const v = this.value as number;
          if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(0) + 'M';
          if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + 'K';
          return v.toString();
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
      },
      series: { states: { inactive: { opacity: 0.25 } } }
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
        const header = `<div style="font-weight: 500; margin-bottom: 12px; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.dateFormat('%B %e, %Y', this.x as number)}</div>`;
        if (groupBy === 'none') {
          const point = this.points?.find((p) => p.series.type === 'area');
          if (!point) return '';
          return `${header}<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 14px; height: 14px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">$${Highcharts.numberFormat(point.y ?? 0, 0, '.', ',')}</span></div>`;
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
        const footer = `<div style="padding-top: 12px; display: flex; justify-content: space-between; align-items: center; gap: 16px;"><span style="font-weight: 500; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">Total</span><span style="font-weight: 500; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(total)}</span></div>`;
        return header + body + footer;
      }
    },
    series: seriesData as unknown as Highcharts.SeriesOptionsType[],
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    rangeSelector: { enabled: false }
  };

  useEffect(() => {
    updateArrows();

    const onResize = () => updateArrows();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [seriesData.length, updateArrows]);

  return (
    <div className={cn('highcharts-container flex h-full flex-col', className)}>
      <div className='relative flex-grow'>
        {areAllSeriesHidden && (
          <Text
            size='11'
            className='text-primary-14 absolute inset-0 flex -translate-y-10 items-center justify-center'
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
      <div className='absolute right-6 block md:hidden'>
        <div className='flex items-center gap-3'>
          <View.Condition if={Boolean(seriesData.length > 1)}>
            <ChartIconToggle
              active={areAllSeriesHidden}
              onClick={areAllSeriesHidden ? handleSelectAll : handleDeselectAll}
              onIcon='eye'
              offIcon='eye-closed'
              ariaLabel='Toggle all series visibility'
            />
          </View.Condition>
        </div>
      </div>
      <div className='mx-5 md:mx-0'>
        <div
          className={cn(
            'bg-secondary-35 shadow-13 relative mx-auto h-[38px] max-w-fit overflow-hidden rounded-[39px]',
            'before:pointer-events-none before:absolute before:top-[1px] before:left-[1px] before:h-full before:w-20 before:rounded-[39px] before:opacity-0',
            'after:pointer-events-none after:absolute after:top-[1px] after:right-[1px] after:h-full after:w-20 after:rounded-r-[39px] after:opacity-0',
            {
              'before:max-h-[36px] before:rotate-180 before:bg-[linear-gradient(270deg,#f8f8f8_55.97%,rgba(112,113,129,0)_99.41%)] before:opacity-100 dark:before:bg-[linear-gradient(90deg,rgba(122,138,153,0)_19.83%,#17212b_63.36%)]':
                canScrollLeft,
              'after:max-h-[36px] after:bg-[linear-gradient(270deg,#f8f8f8_55.97%,rgba(112,113,129,0)_99.41%)] after:opacity-100 dark:after:bg-[linear-gradient(90deg,rgba(122,138,153,0)_19.83%,#17212b_63.36%)]':
                canScrollRight
            }
          )}
        >
          <View.Condition if={canScrollLeft}>
            <Button
              className={cn(
                'bg-secondary-36 absolute top-1/2 left-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-[29px]'
              )}
              onClick={() => {
                clearHighlight();
                scrollByDir('left');
              }}
            >
              <Icon
                name='arrow-triangle'
                className='h-[6px] w-[6px]'
              />
            </Button>
          </View.Condition>
          <div
            ref={viewportRef}
            onScroll={() => {
              updateArrows();
              clearHighlight();
            }}
            className={cn(
              'hide-scrollbar mx-0.5 flex h-full max-w-[99%] items-center gap-4 overflow-x-auto scroll-smooth p-1.5'
            )}
          >
            <Each
              data={seriesData}
              render={(s) => (
                <Button
                  key={s.name}
                  className={cn(
                    'text-primary-14 flex shrink-0 gap-1.5 text-[11px] leading-none font-normal',
                    { 'line-through opacity-30': hiddenItems.has(s.name!) }
                  )}
                  onMouseEnter={() => highlightSeries(s.name!)}
                  onFocus={() => highlightSeries(s.name!)}
                  onMouseLeave={clearHighlight}
                  onBlur={clearHighlight}
                  onClick={() => toggleSeriesByName(s.name!)}
                >
                  <span
                    className='inline-block h-3 w-3 rounded-full'
                    style={{ backgroundColor: (s as any).color }}
                  />
                  {s.name}
                </Button>
              )}
            />
          </div>
          <View.Condition if={canScrollRight}>
            <Button
              className={cn(
                'bg-secondary-36 absolute top-1/2 right-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-[29px]'
              )}
              onClick={() => {
                clearHighlight();
                scrollByDir('right');
              }}
            >
              <Icon
                name='arrow-triangle'
                className='h-[6px] w-[6px] rotate-180'
              />
            </Button>
          </View.Condition>
        </div>
      </div>
    </div>
  );
};

export default CompoundFeeRecieved;
