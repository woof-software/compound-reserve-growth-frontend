import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { cn } from '@/shared/lib/classNames/classNames';
import { getStableColorForSeries } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface EventDataItem {
  x: number;
  title: string;
  text: string;
}

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
  showLegend?: boolean;
  onZoom?: () => void;
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
  showLegend,
  onZoom
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);
  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState(false);
  const [eventsData, setEventsData] = useState<EventDataItem[]>([]);
  const [showEvents, setShowEvents] = useState(true);
  const currentZoom = useRef<{ min: number; max: number } | null>(null);

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

  useEffect(() => {
    const eventsApiUrl =
      'https://compound-reserve-growth-backend-dev.woof.software/api/events';
    const fetchEvents = async () => {
      try {
        const response = await fetch(eventsApiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawEvents: {
          date: number;
          name: string;
          description: string;
        }[] = await response.json();
        const formattedEvents = rawEvents
          .filter((e) => e.date)
          .map((event) => ({
            x: event.date * 1000,
            title: event.name,
            text: event.description || event.name
          }));
        setEventsData(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch chart events:', error);
        setEventsData([]);
      }
    };
    fetchEvents();
  }, []);

  const aggregatedSeries = useMemo<Highcharts.SeriesAreaOptions[]>(() => {
    const allSeriesNames = data.map((series) => series.name);

    if (barSize === 'D') {
      return data.map((series) => ({
        id: series.name,
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        data: series.data.map((d) => [d.x, d.y]),
        color: getStableColorForSeries(series.name, allSeriesNames)
      }));
    }

    return data.map((series) => {
      if (!series.data?.length) {
        return {
          id: series.name,
          type: 'area' as const,
          name: capitalizeFirstLetter(series.name),
          data: [],
          color: getStableColorForSeries(series.name, allSeriesNames)
        };
      }

      const aggregatedPoints = new Map<number, number>();

      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        let periodStartTimestamp: number;

        if (barSize === 'W') {
          const dayOfWeek = date.getUTCDay();
          const diff =
            date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          const startOfWeek = new Date(date);
          startOfWeek.setUTCDate(diff);
          periodStartTimestamp = startOfWeek.getTime();
        } else {
          periodStartTimestamp = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            1
          ).getTime();
        }
        aggregatedPoints.set(periodStartTimestamp, point.y);
      }

      const resultData = Array.from(aggregatedPoints.entries()).map(
        ([timestamp, yValue]) => [timestamp, yValue]
      );

      resultData.sort((a, b) => a[0] - b[0]);

      return {
        id: series.name,
        type: 'area' as const,
        name: capitalizeFirstLetter(series.name),
        data: resultData,
        color: getStableColorForSeries(series.name, allSeriesNames)
      };
    });
  }, [data, barSize]);

  useEffect(() => {
    const chart = chartRef.current?.chart;

    if (!chart || !barCountToSet) return;

    const seriesData = aggregatedSeries[0].data as [number, number][];

    if (seriesData.length === 0) return;

    const len = seriesData.length;
    const start = Math.max(0, len - barCountToSet);

    const min = seriesData[start]![0] ?? 0;
    const max = seriesData[len - 1]![0] ?? 0;

    programmaticChange.current = true;
    chart.xAxis[0].setExtremes(min, max, true);
  }, [barCountToSet, aggregatedSeries]);

  const isLegendEnabled =
    (showLegend ?? groupBy !== 'none') && aggregatedSeries.length > 0;

  const highlightSeries = useCallback((name: string) => {
    const chart = chartRef.current?.chart;

    if (!chart) return;

    chart.series.forEach((s) => {
      const active = s.name === name && s.visible;

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

  const options: Highcharts.Options = useMemo(() => {
    const yPositions = [40, 60, 80, 100, 120, 140, 160, 180];
    const eventPlotLines = showEvents
      ? eventsData.map((event, index) => ({
          color: '#7A8A99',
          width: 1,
          value: event.x,
          dashStyle: 'Dash' as const,
          zIndex: 3,
          label: {
            text: event.title,
            rotation: 0,
            align: 'right' as const,
            verticalAlign: 'top' as const,
            y: yPositions[index % yPositions.length],
            x: -5,
            style: {
              color: 'var(--color-primary-11)',
              fontSize: '11px',
              fontFamily: 'Haas Grot Text R, sans-serif'
            }
          }
        }))
      : [];

    return {
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
            preventDefault: true
          },
          type: undefined,
          pinchType: undefined,
          resetButton: { theme: { display: 'none' } }
        },
        events: {
          load: function () {
            if (currentZoom.current) {
              this.xAxis[0].setExtremes(
                currentZoom.current.min,
                currentZoom.current.max,
                false
              );
            }
          }
        }
      },
      credits: { enabled: false },
      title: { text: '' },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 0,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        tickPixelInterval: 75,
        plotLines: eventPlotLines,
        labels: {
          style: {
            color: '#7A8A99',
            fontSize: '11px',
            fontFamily: 'Haas Grot Text R, sans-serif'
          },
          rotation: 0
        },
        dateTimeLabelFormats: {
          day: '%b %d',
          week: '%b %d',
          month: "%b '%y",
          year: '%Y'
        },
        lineColor: '#7A8A99',
        tickColor: '#7A8A99',
        crosshair: {
          width: 1,
          color: '#7A8A99',
          dashStyle: 'Dash'
        },
        events: {
          setExtremes: function (e) {
            if (programmaticChange.current) {
              programmaticChange.current = false;
              return;
            }

            if (
              e.trigger &&
              e.trigger !== 'navigator' &&
              e.trigger !== 'rangeSelector'
            ) {
              onZoom?.();
            }
          },
          afterSetExtremes: function (e) {
            if (e.min !== undefined && e.max !== undefined) {
              currentZoom.current = { min: e.min, max: e.max };
            }
          }
        }
      },
      yAxis: {
        title: { text: '' },
        gridLineWidth: 1,
        gridLineColor: 'var(--color-secondary-13)',
        gridLineDashStyle: 'Dash',
        labels: {
          style: {
            color: '#7A8A99',
            fontSize: '11px',
            fontFamily: 'Haas Grot Text R, sans-serif'
          },
          formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
            const val = Number(this.value);
            if (isNaN(val)) return this.value.toString();
            if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
            if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
            if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
            return val.toString();
          }
        }
      },
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
            return `${header}<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 8px; height: 8px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.numberFormat(point.y ?? 0, 0, '.', ',')}</span></div>`;
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
                    `<div style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="white-space: nowrap; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span><span style="font-weight: 400; text-align: right; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(point.y ?? 0)}</span></div>`
                )
                .join('');
            body = `<div style="display: flex; gap: 24px;"><div style="display: flex; flex-direction: column;">${renderColumn(col1Points)}</div><div style="display: flex; flex-direction: column;">${renderColumn(col2Points)}</div></div>`;
          } else {
            body = sortedPoints
              .map(
                (point) =>
                  `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(point.y ?? 0)}</span></div>`
              )
              .join('');
          }
          const footer = `<div style=" padding-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px;"><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">Total</span><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatValue(total)}</span></div>`;
          return header + body + footer;
        }
      },
      legend: { enabled: false },
      plotOptions: {
        series: {
          animation: false,
          turboThreshold: 0
        },
        area: {
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 5,
            states: { hover: { enabled: true, radius: 5 } }
          },
          lineWidth: 2,
          states: { hover: { lineWidthPlus: 0 } },
          threshold: null,
          fillOpacity: 0.1,
          findNearestPointBy: 'x'
        }
      },
      series: aggregatedSeries,
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      rangeSelector: { enabled: false }
    };
  }, [
    aggregatedSeries,
    groupBy,
    isLegendEnabled,
    eventsData,
    showEvents,
    onZoom
  ]);

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

  useEffect(() => {
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [aggregatedSeries.length, updateArrows]);

  return (
    <div
      className={cn(
        'highcharts-container relative flex h-full flex-col',
        className
      )}
    >
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
          options={options}
          allowChartUpdate
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
      <div className='absolute right-6 block'>
        <div className='flex items-center gap-3'>
          <View.Condition
            if={Boolean(isLegendEnabled && aggregatedSeries.length > 1)}
          >
            <div
              className='shadow-13 bg-card-header cursor-pointer rounded-lg p-1'
              onClick={areAllSeriesHidden ? handleSelectAll : handleDeselectAll}
            >
              <Icon
                name={areAllSeriesHidden ? 'eye' : 'eye-closed'}
                className='h-6 w-6'
              />
            </div>
          </View.Condition>
          <View.Condition if={Boolean(eventsData.length > 0)}>
            <div
              className='shadow-13 bg-card-header cursor-pointer rounded-lg p-1'
              onClick={() => setShowEvents((prev) => !prev)}
            >
              <Icon
                name={showEvents ? 'calendar-check' : 'calendar-uncheck'}
                className='h-6 w-6'
              />
            </div>
          </View.Condition>
        </div>
      </div>
      {isLegendEnabled && (
        <>
          <div className='mx-5 block md:mx-0 lg:hidden'>
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
                  data={aggregatedSeries}
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
          <div className='mx-auto hidden max-w-[902px] flex-wrap justify-start gap-[35px] px-[15px] py-2 lg:flex'>
            <Each
              data={aggregatedSeries}
              render={(s) => (
                <Button
                  key={s.name}
                  className={cn(
                    'text-secondary-42 flex shrink-0 gap-2.5 text-[11px] leading-none font-normal',
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
        </>
      )}
    </div>
  );
};

export default LineChart;
