import { Format } from '@/shared/lib/utils/numbersFormatter';
import Highcharts from 'highcharts';

export const customTooltipFormatter =
  (view: string) => (context: { x: number; points: any[] }) => {
    const header = `<div class="font-medium mb-3 text-[11px] font-haas">
      ${Highcharts.dateFormat('%B %e, %Y', context.x)}
    </div>`;

    const pointsSortedDesc = [...context.points].sort(
      (a, b) => (b.y ?? 0) - (a.y ?? 0)
    );

    const body = `<div class='flex flex-col gap-3'>
      ${
        pointsSortedDesc
          .map(
            (point) =>
              `<div class="flex justify-between items-center gap-4">
              <div class="flex items-center gap-2">
                <span style="background-color:${point.series.color};" class="w-2.5 h-2.5 inline-block rounded-sm"></span>
                <span class="text-[11px] font-haas">${point.series.name}</span>
              </div>
              <span class="font-normal text-[11px] font-haas">
                 ${view === 'COMP' ? Format.token(point.y, 'standard', 'COMP') : Format.price(point.y, 'standard')}
              </span>
            </div>`
          )
          .join('') || ''
      }
    </div>`;

    return header + body;
  };

export const customChartOptions = (view: string) => ({
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return view === 'COMP'
          ? Format.token(this.value, 'compact', 'COMP')
          : Format.price(this.value, 'compact');
      }
    }
  }
});
