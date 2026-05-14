import Highcharts, { Point } from 'highcharts';

import { Format } from '@/shared/lib/utils/format';

const MOBILE_BREAKPOINT = 1023;

const getSeriesColor = (color: Highcharts.ColorType): string =>
  typeof color === 'string' ? color : '#ccc';

const row = (point: Highcharts.Point) => `
  <div class="grid items-center gap-2" style="grid-template-columns:auto 1fr auto;">
    <span
      class="inline-block w-2.5 h-2.5 rounded-sm"
      style="background-color:${getSeriesColor(point.series.color ?? '')};"
    ></span>
    <span class="text-[11px] font-haas min-w-0 w-max">
      ${point.series.name}
    </span>
    <span class="text-[11px] font-haas font-normal text-right whitespace-nowrap">
      ${Format.price(point.y ?? 0, 'standard')}
    </span>
  </div>`;

const chunkArray = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: size }, (_, i) => {
    const chunkSize = Math.ceil(arr.length / size);
    return arr.slice(i * chunkSize, (i + 1) * chunkSize);
  });

const buildColumns = (sorted: Highcharts.Point[], columnCount: number): string => {
  const columns = chunkArray(sorted, columnCount);

  return `
    <div style="display:flex;gap:24px;">
      ${columns
    .map(
      (col) => `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${col.map(row).join('')}
        </div>`
    )
    .join('')}
    </div>`;
};

const buildBody = (sorted: Highcharts.Point[], groupBy?: string): string => {
  if (groupBy === 'deployment') {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    return buildColumns(sorted, isMobile ? 2 : 3);
  }

  return `<div style="display:flex;flex-direction:column;gap:8px;">${sorted.map(row).join('')}</div>`;
};

export const customTooltipFormatter = (context: Point, groupBy?: string): string => {
  const points = (context.points ?? []).filter(
    (p) => p?.series?.type !== 'scatter'
  );

  const sorted = [...points].sort((a, b) => (b.y ?? 0) - (a.y ?? 0));

  const total = points.reduce((sum, p) => sum + (p.y ?? 0), 0);

  const header = `
    <div class="font-medium mb-3 text-[11px] font-haas">
      ${Highcharts.dateFormat('%B %e, %Y', context.x as number)}
    </div>`;

  const body = buildBody(sorted, groupBy);

  const footer = `
    <div class="flex justify-between items-center gap-4 mt-4">
      <span class="text-[11px] font-haas">Total</span>
      <span class="text-[11px] font-haas">${Format.price(total, 'standard')}</span>
    </div>`;

  return `<div>${header}${body}${footer}</div>`;
};

export const customChartOptions: Highcharts.Options = {
  tooltip: {
    useHTML: true,
  },
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif',
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return Format.chartAxis(this.value, { type: 'usd', view: 'compact' });
      },
    },
  },
};