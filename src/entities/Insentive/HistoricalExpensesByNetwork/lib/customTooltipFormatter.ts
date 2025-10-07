import Highcharts from 'highcharts';

import { formatLargeNumber } from '@/shared/lib/utils/utils';

export const customTooltipFormatter =
  (view: string) => (context: { x: number; points: any[] }) => {
    const header = `<div class="font-medium mb-3 text-[11px] font-haas">
      ${Highcharts.dateFormat('%B %e, %Y', context.x)}
    </div>`;

    const body = `<div class='flex flex-col gap-3'>
      ${
        context.points
          ?.reverse()
          .map(
            (point) =>
              `<div class="flex justify-between items-center gap-4">
              <div class="flex items-center gap-2">
                <span style="background-color:${point.series.color};" class="w-2.5 h-2.5 inline-block rounded-sm"></span>
                <span class="text-[11px] font-haas">${point.series.name}</span>
              </div>
              <span class="font-normal text-[11px] font-haas">
                 ${view === 'COMP' ? formatLargeNumber(point.y, 2) : '$' + formatLargeNumber(point.y, 2)}
              </span>
            </div>`
          )
          .join('') || ''
      }
    </div>`;

    return header + body;
  };
