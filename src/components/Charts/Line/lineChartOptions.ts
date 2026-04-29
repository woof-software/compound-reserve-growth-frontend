import Highcharts, { Options, Point, SeriesAreaOptions } from 'highcharts';

import { CompoundEvent } from '@/shared/hooks/useEventsApi';
import { Format } from '@/shared/lib/utils/format';

interface GetLineChartOptionsParams {
  aggregatedSeries: SeriesAreaOptions[];
  groupBy: string;
  events: CompoundEvent[];
  showEvents: boolean;
  customTooltipFormatter?: (context: Point, groupBy: string) => string;
  defaultTooltipFormatter: (context: any) => string;
  customOptions?: Partial<Options>;
  currentZoom: React.MutableRefObject<{ min: number; max: number } | null>;
  programmaticChange: React.MutableRefObject<boolean>;
}

export const getLineChartOptions = ({
  aggregatedSeries,
  groupBy,
  events,
  showEvents,
  customTooltipFormatter,
  defaultTooltipFormatter,
  customOptions,
  currentZoom,
  programmaticChange
}: GetLineChartOptionsParams): Highcharts.Options => {
  const yPositions = [40, 60, 80, 100, 120, 140, 160, 180];

  let eventPlotLines: Highcharts.XAxisPlotLinesOptions[] = [];

  if (showEvents) {
    eventPlotLines = events.map((event, index) => ({
      color: '#7A8A99',
      width: 1,
      value: event.date * 1000,
      dashStyle: 'Dash',
      zIndex: 3,
      label: {
        text: event.name,
        rotation: 0,
        align: 'right',
        verticalAlign: 'top',
        y: yPositions[index % yPositions.length],
        x: -5,
        style: {
          color: 'var(--color-primary-11)',
          fontSize: '11px',
          fontFamily: 'Haas Grot Text R, sans-serif'
        }
      }
    }));
  }

  const bringMarkersToFront = (chart: Highcharts.Chart) => {
    chart.series.forEach((s: any) => {
      s.markerGroup?.toFront?.();
      s.dataLabelsGroup?.toFront?.();
    });
  };

  const baseOptions: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      plotBorderWidth: 0,
      plotShadow: false,
      animation: false,
      panning: { enabled: true, type: 'x' },
      zooming: {
        mouseWheel: { enabled: true, type: 'x', preventDefault: true },
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
      crosshair: { width: 1, color: '#7A8A99', dashStyle: 'Dash' },
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
          return Format.token(this.value, 'compact');
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
        if (customTooltipFormatter) {
          return customTooltipFormatter(this as unknown as Point, groupBy);
        }
        return defaultTooltipFormatter(this);
      }
    },
    legend: { enabled: false },
    plotOptions: {
      series: { animation: false, turboThreshold: 0 },
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

  return customOptions
    ? Highcharts.merge(baseOptions, customOptions)
    : baseOptions;
};
