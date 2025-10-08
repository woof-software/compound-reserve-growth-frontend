import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Highcharts, { SeriesAreaOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { EventDataItem } from '@/shared/hooks/useLineChart';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import View from '@/shared/ui/View/View';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface LineDataItem {
  x: number;
  y: number;
}

export interface LineChartSeries {
  name: string;
  data: LineDataItem[];
}

interface SpecificLineChartProps {
  data: LineChartSeries[];

  groupBy: string;

  chartRef: RefObject<HighchartsReact.RefObject | null>;

  isLegendEnabled: boolean;

  eventsData?: EventDataItem[];

  aggregatedSeries: SeriesAreaOptions[];

  showEvents: boolean;

  areAllSeriesHidden: boolean;

  className?: string;

  onAllSeriesHidden: (value: boolean) => void;

  onSelectAll: () => void;

  onDeselectAll: () => void;

  onShowEvents: (value: boolean) => void;

  onEventsData: (value: EventDataItem[]) => void;
}

const SpecificLineChart: FC<SpecificLineChartProps> = ({
  data,
  groupBy,
  chartRef,
  isLegendEnabled,
  eventsData = [],
  showEvents,
  aggregatedSeries,
  areAllSeriesHidden,
  className,
  onAllSeriesHidden,
  onSelectAll,
  onDeselectAll,
  onShowEvents,
  onEventsData
}) => {
  const programmaticChange = useRef(false);

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

  const isLastActiveLegend = useMemo(() => {
    return hiddenItems.size === aggregatedSeries.length - 1;
  }, [aggregatedSeries, hiddenItems]);

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

  const toggleSeriesByName = useCallback(
    (name: string) => {
      if (isLastActiveLegend && !hiddenItems.has(name)) return;

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

        onAllSeriesHidden(!anyVisible);
      }, 0);
    },
    [isLastActiveLegend]
  );

  const options: Highcharts.Options = useMemo(() => {
    const yPositions = [40, 60, 80, 100, 120, 140, 160, 180];
    const eventPlotLines = showEvents
      ? eventsData?.map((event, index) => ({
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

    const bringMarkersToFront = (chart: Highcharts.Chart) => {
      chart.series.forEach((s: any) => {
        s.markerGroup?.toFront?.();
        s.dataLabelsGroup?.toFront?.();
      });
    };

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
          pinchType: 'x',
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

            bringMarkersToFront(this as Highcharts.Chart);
          },
          render: function () {
            bringMarkersToFront(this as Highcharts.Chart);
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
          setExtremes: function () {
            if (programmaticChange.current) {
              programmaticChange.current = false;
              return;
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
        backgroundColor: '#0B162180',
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

          let body = '';

          body = `
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="width: 10px; height: 15px; display: inline-block;">--</span>
                      <span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                        Collateral price limitation
                      </span>
                    </div>
                    <span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                      173.5M
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="background-color:#00D395; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span>
                      <span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                        Collateral Price
                      </span>
                    </div>
                    <span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                      173.5M
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="background-color:#3877FF; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span>
                      <span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                        Base Assets Price
                      </span>
                    </div>
                    <span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">
                      173.5M
                    </span>
                  </div>
                </div>
              `;

          return header + body;
        }
      },
      legend: { enabled: false },
      plotOptions: {
        series: {
          animation: false,
          turboThreshold: 0,
          color: '#C1C1C1',
          marker: {
            fillColor: '#C1C1C1',
            lineColor: '#C1C1C1'
          }
        },
        area: {
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 5,
            states: {
              hover: {
                enabled: true,
                radius: 4,
                lineColor: '#C1C1C1',
                lineWidth: 2,
                fillColor: '#FFFFFF'
              }
            },
            fillColor: '#FFFFFF',
            lineColor: '#C1C1C1'
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
  }, [aggregatedSeries, groupBy, isLegendEnabled, eventsData, showEvents]);

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
        onEventsData(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch chart events:', error);
        onEventsData([]);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    updateArrows();

    const onResize = () => updateArrows();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [aggregatedSeries.length, updateArrows]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    chart.series.forEach((s) => {
      if (hiddenItems.has(s.name)) {
        if (s.visible) s.setVisible(false, false);
      } else {
        if (!s.visible) s.setVisible(true, false);
      }
    });

    chart.redraw();
  }, [areAllSeriesHidden, hiddenItems]);

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
          options={options}
          allowChartUpdate
          containerProps={{
            style: {
              display: !areAllSeriesHidden ? 'block' : 'none',
              width: '100%',
              height: '100%',
              touchAction: 'none',
              overscrollBehaviorX: 'contain'
            }
          }}
        />
      </div>
      <div className='absolute right-0 block'>
        <div className='hidden items-center gap-2 lg:flex'>
          <View.Condition
            if={Boolean(isLegendEnabled && aggregatedSeries.length > 1)}
          >
            <ChartIconToggle
              active={areAllSeriesHidden}
              onClick={areAllSeriesHidden ? onSelectAll : onDeselectAll}
              onIcon='eye'
              offIcon='eye-closed'
              ariaLabel='Toggle all series visibility'
            />
          </View.Condition>
          <View.Condition if={Boolean(eventsData?.length > 0)}>
            <ChartIconToggle
              active={!showEvents}
              onClick={() => onShowEvents(!showEvents)}
              onIcon='calendar-check'
              offIcon='calendar-uncheck'
              ariaLabel='Toggle events'
            />
          </View.Condition>
        </div>
      </div>
      <View.Condition
        if={Boolean(isLegendEnabled && !areAllSeriesHidden && data.length > 1)}
      >
        <div className='mx-5 block md:mx-0 lg:hidden'>
          <div
            className={cn(
              'bg-secondary-35 shadow-13 relative mx-auto h-[38px] max-w-fit overflow-hidden rounded-lg',
              'before:pointer-events-none before:absolute before:top-[1px] before:left-[1px] before:z-[2] before:h-full before:w-20 before:rounded-sm before:opacity-0',
              'after:pointer-events-none after:absolute after:top-[1px] after:right-[1px] after:h-full after:w-20 after:rounded-r-sm after:opacity-0',
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
                  'bg-secondary-36 absolute top-1/2 left-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-sm'
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
                'hide-scrollbar mx-0.5 flex h-full max-w-[99%] items-center gap-4 overflow-x-auto scroll-smooth rounded-lg p-1.5'
              )}
            >
              <Each
                data={aggregatedSeries}
                render={(s) => (
                  <Button
                    key={s.name}
                    className={cn(
                      'text-primary-14 flex shrink-0 gap-1.5 text-[11px] leading-none font-normal',
                      {
                        'line-through opacity-30': hiddenItems.has(s.name!),
                        'cursor-not-allowed':
                          isLastActiveLegend && !hiddenItems.has(s.name!)
                      }
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
                  'bg-secondary-36 absolute top-1/2 right-1.5 z-[2] grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-sm'
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
        <View.Condition if={Boolean(aggregatedSeries.length > 1)}>
          <div className='mx-auto hidden max-w-[902px] flex-wrap justify-center gap-5 px-[15px] py-2 lg:flex'>
            <Each
              data={aggregatedSeries}
              render={(s) => (
                <Button
                  key={s.name}
                  className={cn(
                    'text-secondary-42 flex shrink-0 gap-2.5 text-[11px] leading-none font-normal',
                    {
                      'line-through opacity-30': hiddenItems.has(s.name!),
                      'cursor-not-allowed':
                        isLastActiveLegend && !hiddenItems.has(s.name!)
                    }
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
        </View.Condition>
      </View.Condition>
    </div>
  );
};

export default SpecificLineChart;
