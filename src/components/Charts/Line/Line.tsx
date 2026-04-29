import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import Highcharts, {
  Options,
  Point,
  Series,
  SeriesAreaOptions
} from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import LineChartLegend from '@/components/Charts/Line/LineChartLegend';
import { getLineChartOptions } from '@/components/Charts/Line/lineChartOptions';
import { CompoundEvent } from '@/shared/hooks/useEventsApi';
import { Legend } from '@/shared/hooks/useLegends';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/format';
import { noop } from '@/shared/lib/utils/utils';
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

interface LineChartProps {
  groupBy: string;
  aggregatedSeries: SeriesAreaOptions[];
  chartRef?: RefObject<HighchartsReact.RefObject | null>;
  isLegendEnabled?: boolean;
  legends?: Legend[];
  showEvents?: boolean;
  events?: CompoundEvent[];
  className?: string;
  customTooltipFormatter?: (context: Point, groupBy: string) => string;
  customOptions?: Partial<Options>;
  onSelectAllLegends?: () => void;
  onDeselectAllLegends?: () => void;
  onShowEvents?: (value: boolean) => void;
  onLegendHover?: (id: string) => void;
  onLegendLeave?: (id?: string) => void;
  onLegendClick?: (id: string) => void;
  resetZoomKey?: string;
}

const LineChart: FC<LineChartProps> = ({
  groupBy,
  aggregatedSeries,
  chartRef = useRef<HighchartsReact.RefObject | null>(null),
  isLegendEnabled = false,
  showEvents = false,
  className,
  customTooltipFormatter,
  customOptions,
  events = [],
  legends = [],
  onSelectAllLegends = noop,
  onDeselectAllLegends = noop,
  onShowEvents = noop,
  onLegendHover = noop,
  onLegendLeave = noop,
  onLegendClick = noop,
  resetZoomKey
}) => {
  const programmaticChange = useRef(false);
  const currentZoom = useRef<{ min: number; max: number } | null>(null);

  const areAllSeriesHidden = legends.every(({ isDisabled }) => isDisabled);

  const isLastActiveLegend =
    legends.filter(({ isDisabled }) => !isDisabled).length === 1;

  const dataExtremes = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    aggregatedSeries.forEach((series) => {
      (series.data || []).forEach((point) => {
        const x = Array.isArray(point)
          ? Number(point[0])
          : Number((point as { x?: number }).x);
        if (!Number.isFinite(x)) return;
        min = Math.min(min, x);
        max = Math.max(max, x);
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return null;
    }

    return { min, max };
  }, [aggregatedSeries]);

  useEffect(() => {
    if (resetZoomKey === undefined) return;
    const chart = chartRef.current?.chart;
    if (!chart || !dataExtremes) return;

    const extremes = chart.xAxis[0].getExtremes();
    if (
      extremes.min === dataExtremes.min &&
      extremes.max === dataExtremes.max
    ) {
      return;
    }

    currentZoom.current = null;
    programmaticChange.current = true;
    chart.xAxis[0].setExtremes(dataExtremes.min, dataExtremes.max, true, false);
  }, [chartRef, dataExtremes, resetZoomKey]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    let highlightedSeries: Series | null = null;
    let isNeedRedraw = false;

    for (const legend of legends) {
      const series = chart?.series.find(({ name }) => name === legend.name);
      if (!series) continue;

      if (series.visible !== !legend.isDisabled) {
        series.setVisible(!legend.isDisabled, false);
        isNeedRedraw = true;
      }

      if (!legend.isDisabled && legend.isHighlighted) {
        highlightedSeries = series;
      }
    }

    if (isNeedRedraw) {
      chart.redraw();
    }

    if (!highlightedSeries) return;

    for (const series of chart?.series ?? []) {
      const config = { opacity: 0 };

      if (highlightedSeries === series) {
        config.opacity = 1;
        //@ts-expect-error wrong Highcharts types
        series.group?.attr(config);
        //@ts-expect-error wrong Highcharts types
        series.markerGroup?.attr?.(config);
        //@ts-expect-error wrong Highcharts types
        series.dataLabelsGroup?.attr?.(config);
        //@ts-expect-error wrong Highcharts types
        series.group?.toFront();
      } else {
        config.opacity = 0.25;
        //@ts-expect-error wrong Highcharts types
        series.group?.attr(config);
        //@ts-expect-error wrong Highcharts types
        series.markerGroup?.attr?.(config);
        //@ts-expect-error wrong Highcharts types
        series.dataLabelsGroup?.attr?.(config);
      }
    }
  }, [legends]);

  const defaultTooltipFormatter = useCallback(
    (context: any) => {
      const header = `<div style="font-weight: 500; margin-bottom: 12px; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.dateFormat('%B %e, %Y', context.x as number)}</div>`;

      if (groupBy === 'none') {
        const point = context.points?.find(
          (p: { series: { type: string } }) => p.series.type === 'area'
        );
        if (!point) return '';
        return `${header}<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 8px; height: 8px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.numberFormat(point.y ?? 0, 0, '.', ',')}</span></div>`;
      }

      const dataPoints = (context.points || []).filter(
        (p: { series: { type: string } }) => p.series.type !== 'scatter'
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
                `<div style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="white-space: nowrap; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span><span style="font-weight: 400; text-align: right; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Format.price(point.y ?? 0, 'standard')}</span></div>`
            )
            .join('');
        body = `<div style="display: flex; gap: 24px;"><div style="display: flex; flex-direction: column;">${renderColumn(col1Points)}</div><div style="display: flex; flex-direction: column;">${renderColumn(col2Points)}</div></div>`;
      } else {
        body = sortedPoints
          .map(
            (point) =>
              `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;"><div style="display: flex; align-items: center; gap: 8px;"><span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span><span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span></div><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Format.price(point.y ?? 0, 'standard')}</span></div>`
          )
          .join('');
      }
      const footer = `<div style="padding-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 16px;"><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">Total</span><span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Format.price(total, 'standard')}</span></div>`;
      return header + body + footer;
    },
    [groupBy]
  );

  const options = useMemo(
    () =>
      getLineChartOptions({
        aggregatedSeries,
        groupBy,
        events,
        showEvents,
        customTooltipFormatter,
        defaultTooltipFormatter,
        customOptions,
        currentZoom,
        programmaticChange
      }),
    [
      aggregatedSeries,
      groupBy,
      events,
      showEvents,
      customTooltipFormatter,
      defaultTooltipFormatter,
      customOptions
    ]
  );

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
              display: 'block',
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
              onClick={() => {
                if (areAllSeriesHidden) {
                  onSelectAllLegends();
                } else {
                  onDeselectAllLegends();
                }
              }}
              onIcon='eye'
              offIcon='eye-closed'
              ariaLabel='Toggle all series visibility'
            />
          </View.Condition>
          <View.Condition if={Boolean(events?.length > 0)}>
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
      <View.Condition if={isLegendEnabled && aggregatedSeries.length > 1}>
        <LineChartLegend
          legends={legends}
          isLastActiveLegend={isLastActiveLegend}
          onLegendHover={onLegendHover}
          onLegendLeave={onLegendLeave}
          onLegendClick={onLegendClick}
        />
      </View.Condition>
    </div>
  );
};

export default LineChart;
