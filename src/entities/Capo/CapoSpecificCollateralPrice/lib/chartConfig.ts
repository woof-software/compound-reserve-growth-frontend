import Highcharts from 'highcharts';

import { formatUSD } from '@/shared/lib/utils/utils';

export const customFormatter = (context: { x: number; points: any[] }) => {
  const header = `<div style="font-weight: 500; margin-bottom: 12px; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${Highcharts.dateFormat('%B %e, %Y', context.x)}</div>`;

  const body = `<div style='display: flex; flex-direction: column; gap: 12px'>
  ${
    context.points
      ?.reverse()
      .map(
        (point) =>
          `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background-color:${point.series.color}; width: 10px; height: 10px; display: inline-block; border-radius: 2px;"></span>
            <span style="font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${point.series.name}</span>
          </div>
          <span style="font-weight: 400; font-size: 11px; font-family: 'Haas Grot Text R', sans-serif;">${formatUSD(point.y)}</span>
        </div>`
      )
      .join('') || ''
  }
</div>`;

  return header + body;
};

export const customOptions = {
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return `$${this.value}`;
      }
    }
  }
};
