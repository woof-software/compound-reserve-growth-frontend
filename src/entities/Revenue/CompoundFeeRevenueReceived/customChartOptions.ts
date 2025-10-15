import Highcharts, { Point } from 'highcharts';

import { Format } from '@/shared/lib/utils/numbersFormatter';

export const customTooltipFormatter = (context: Point, groupBy?: string) => {
  const header = `<div class="font-medium mb-3 text-[11px] font-haas">
    ${Highcharts.dateFormat('%B %e, %Y', context.x as number)}
  </div>`;

  const points = (context.points ?? []).filter(
    (p) => p && p.series && p.series.type !== 'scatter'
  );

  const sorted = [...points].sort((a, b) => (b.y ?? 0) - (a.y ?? 0));

  const total =
    context.points?.reduce((sum, point) => sum + (point.y ?? 0), 0) ?? 0;

  const row = (point: Highcharts.Point) => `
    <div style="display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;">
      <span style="background-color:${point.series.color};width:10px;height:10px;display:inline-block;border-radius:2px;"></span>

      <span style="font-size:11px;font-family:'Haas Grot Text R',sans-serif;min-width:0;width:max-content;">
        ${point.series.name}
      </span>

      <span style="font-weight:400;text-align:right;font-size:11px;font-family:'Haas Grot Text R',sans-serif;white-space:nowrap;">
        ${Format.price(point.y ?? 0, 'standard')}
      </span>
    </div>`;

  let body: string;
  if (groupBy === 'Market') {
    const mid = Math.ceil(sorted.length / 2);
    const col1 = sorted.slice(0, mid);
    const col2 = sorted.slice(mid);

    body = `
      <div style="display:flex;gap:24px;">
        <div style="display:flex;flex-direction:column;gap:8px;">${col1.map(row).join('')}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">${col2.map(row).join('')}</div>
      </div>`;
  } else {
    body = `<div class="flex flex-col gap-3">${sorted.map(row).join('')}</div>`;
  }

  const footer = `
        <div class="flex justify-between items-center gap-4 mt-4">
        <span class="text-[11px] font-haas">Total</span>
        <span class="text-[11px] font-haas">
          ${Format.price(total, 'standard')}
        </span>
      </div>
  `;

  return `
    <div>
      ${header}${body}${footer}
    </div>`;
};

export const customChartOptions = {
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return Format.chartAxis(this.value, { type: 'usd', view: 'compact' });
      }
    }
  }
};
