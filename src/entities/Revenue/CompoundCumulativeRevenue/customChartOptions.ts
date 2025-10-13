import Highcharts, { Point } from 'highcharts';

import { Format } from '@/shared/lib/utils/numbersFormatter';

export const customTooltipFormatter = (context: Point) => {
  const header = `<div class="font-medium mb-3 text-[11px] font-haas">
      ${Highcharts.dateFormat('%B %e, %Y', context.x)}
    </div>`;

  const total =
    context.points?.reduce((sum, point) => sum + (point.y ?? 0), 0) ?? 0;

  const body = `<div class='flex flex-col gap-3'>
      ${
        context.points
          ?.map(
            (point) =>
              `<div class="flex justify-between items-center gap-4">
              <div class="flex items-center gap-2">
                <span style="background-color:${point.series.color};" class="w-2.5 h-2.5 inline-block rounded-sm"></span>
                <span class="text-[11px] font-haas">${point.series.name}</span>
              </div>
              <span class="font-normal text-[11px] font-haas">
                 ${Format.price(point.y ?? 0, 'standard')}
              </span>
            </div>`
          )
          .join('') || ''
      }
      <div class="flex justify-between items-center gap-4">
        <span class="text-[11px] font-haas">Total</span>
        <span class="text-[11px] font-haas">
          ${Format.price(total, 'standard')}
        </span>
      </div>
    </div>`;

  return header + body;
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
