import Highcharts from 'highcharts';

import { Format } from '@/shared/lib/utils/numbersFormatter';

export const customChartOptions = {
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return Format.chartAxis(this.value, { type: 'usd', view: 'standard' });
      }
    }
  }
};
