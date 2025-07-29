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
import Text from '@/shared/ui/Text/Text';

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
  showLegend
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);
  const [areAllSeriesHidden, setAreAllSeriesHidden] = useState(false);
  const [eventsData, setEventsData] = useState<EventDataItem[]>([]);
  const [showEvents, setShowEvents] = useState(true);

  const currentZoom = useRef<{ min: number; max: number } | null>(null);

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

  useEffect(() => {
    setAreAllSeriesHidden(false);
  }, [data]);

  const aggregatedSeries = useMemo(() => {
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
      if (!series.data || series.data.length === 0) {
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
    if (!chart || !barCountToSet || !aggregatedSeries[0]?.data.length) return;

    const dataLength = aggregatedSeries[0].data.length;
    const startIndex = Math.max(0, dataLength - barCountToSet);

    if (startIndex < dataLength) {
      const min = aggregatedSeries[0].data[startIndex][0];
      const max = aggregatedSeries[0].data[dataLength - 1][0];
      programmaticChange.current = true;
      chart.xAxis[0].setExtremes(min, max, true);
    }
  }, [barCountToSet, aggregatedSeries]);

  const isLegendEnabled = showLegend ?? groupBy !== 'none';

  const handleSelectAll = useCallback(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chart.series.forEach(
      (s) => s.type !== 'flags' && s.setVisible(true, false)
    );
    chart.redraw();
    setAreAllSeriesHidden(false);
  }, []);

  const handleDeselectAll = useCallback(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chart.series.forEach(
      (s) => s.type !== 'flags' && s.setVisible(false, false)
    );
    chart.redraw();
    setAreAllSeriesHidden(true);
  }, []);

  const options: Highcharts.Options = useMemo(() => {
    const yPositions = [40, 60, 80, 100, 120, 140, 160, 180];
    const eventPlotLines = showEvents
      ? eventsData.map((event, index) => ({
          color: 'var(--color-primary-14)',
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
            style: { color: 'var(--color-primary-11)', fontSize: '11px' }
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
          style: { color: 'var(--color-primary-14)', fontSize: '11px' },
          rotation: 0
        },
        dateTimeLabelFormats: {
          day: '%b %d',
          week: '%b %d',
          month: "%b '%y",
          year: '%Y'
        },
        lineColor: 'var(--color-secondary-12)',
        tickColor: 'var(--color-secondary-12)',
        crosshair: {
          width: 1,
          color: 'var(--color-primary-14)',
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
        gridLineWidth: 0,
        labels: {
          style: { color: 'var(--color-primary-14)', fontSize: '11px' },
          formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
            const val = Number(this.value);
            if (isNaN(val)) return this.value.toString();
            if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
            if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
            if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
            return val.toString();
          }
        },
        gridLineColor: 'var(--color-secondary-13)'
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
          fontFamily: 'Haas Grot Text R'
        },
        shared: true,
        formatter: function () {
          const header = `<div style="font-weight: 500; margin-bottom: 8px; font-size: 12px;">${Highcharts.dateFormat('%B %e, %Y', this.x as number)}</div>`;
          if (groupBy === 'none') {
            const point = this.points?.find((p) => p.series.type === 'area');
            if (!point) return '';
            return `${header}<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 8px; height: 8px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px;">${point.series.name}</span></div><span style="font-weight: 500; font-size: 11px;">$${Highcharts.numberFormat(point.y ?? 0, 0, '.', ',')}</span></div>`;
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
                    `<div style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; margin-bottom: 4px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="white-space: nowrap; font-size: 11px;">${point.series.name}</span><span style="font-weight: 500; text-align: right; font-size: 11px;">${formatValue(point.y ?? 0)}</span></div>`
                )
                .join('');
            body = `<div style="display: flex; gap: 24px;"><div style="display: flex; flex-direction: column;">${renderColumn(col1Points)}</div><div style="display: flex; flex-direction: column;">${renderColumn(col2Points)}</div></div>`;
          } else {
            body = sortedPoints
              .map(
                (point) =>
                  `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px;">${point.series.name}</span></div><span style="font-weight: 500; font-size: 11px;">${formatValue(point.y ?? 0)}</span></div>`
              )
              .join('');
          }
          const footer = `<div style=" padding-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px;"><span style="font-weight: 500; font-size: 12px;">Total</span><span style="font-weight: 500; font-size: 11px;">${formatValue(total)}</span></div>`;
          return header + body + footer;
        }
      },
      legend: {
        enabled: isLegendEnabled,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        symbolRadius: 0,
        symbolWidth: 10,
        symbolHeight: 10,
        itemStyle: { color: 'var(--color-primary-11)', fontWeight: 'normal' },
        itemHoverStyle: { color: 'var(--color-primary-11)' }
      },
      plotOptions: {
        series: {
          animation: false,
          turboThreshold: 0,
          events: {
            legendItemClick: function (this: Highcharts.Series): boolean {
              if (this.type === 'flags') return false;
              const chart = this.chart;
              const isAnyOtherSeriesVisible = chart.series.some(
                (s) => s !== this && s.visible && s.type !== 'flags'
              );
              if (!this.visible && !isAnyOtherSeriesVisible) {
                chart.series.forEach((s) => {
                  if (s.type !== 'flags') s.setVisible(s === this, false);
                });
                chart.redraw();
                setAreAllSeriesHidden(false);
                return false;
              }
              setTimeout(() => {
                const isAnySeriesVisibleAfterClick = chart.series.some(
                  (s) => s.visible && s.type !== 'flags'
                );
                setAreAllSeriesHidden(!isAnySeriesVisibleAfterClick);
              }, 0);
              return true;
            }
          }
        },
        area: {
          lineWidth: 2,
          marker: {
            enabled: false,
            symbol: 'circle',
            states: { hover: { enabled: true, radius: 3 } }
          },
          states: { hover: { lineWidthPlus: 0 } },
          threshold: null,
          fillOpacity: 0.1,
          stacking: 'normal',
          findNearestPointBy: 'x'
        }
      },
      series: aggregatedSeries,
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      rangeSelector: { enabled: false }
    };
  }, [aggregatedSeries, groupBy, isLegendEnabled, eventsData, showEvents]);

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
          options={options}
          allowChartUpdate
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
      <div className='flex shrink-0 items-center justify-center gap-4 py-2'>
        {isLegendEnabled && aggregatedSeries.length > 1 && (
          <Button
            onClick={areAllSeriesHidden ? handleSelectAll : handleDeselectAll}
            className='text-primary-14 cursor-pointer rounded-md border border-[color:var(--color-primary-16)] px-2 py-1 text-[12px] hover:border-[color:var(--color-primary-14)]'
          >
            {areAllSeriesHidden ? 'Select All' : 'Unselect All'}
          </Button>
        )}
        {eventsData.length > 0 && (
          <Button
            onClick={() => setShowEvents((prev) => !prev)}
            className='text-primary-14 cursor-pointer rounded-md border border-[color:var(--color-primary-16)] px-2 py-1 text-[12px] hover:border-[color:var(--color-primary-14)]'
          >
            {showEvents ? 'Hide Events' : 'Show Events'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LineChart;
