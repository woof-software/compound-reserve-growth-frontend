import { Format } from '@/shared/lib/utils/numbersFormatter';
import Highcharts from 'highcharts';

export const customChartOptions = {
  yAxis: {
    labels: {
      style: {
        color: '#7A8A99',
        fontSize: '11px',
        fontFamily: 'Haas Grot Text R, sans-serif'
      },
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        return Format.price(this.value, 'compact');
      }
    }
  }
};
