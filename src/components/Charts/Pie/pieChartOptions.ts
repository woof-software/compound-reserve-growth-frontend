import Highcharts from 'highcharts';

export const getPieChartOptions = (
  chartData: Highcharts.PointOptionsObject[]
): Highcharts.Options => ({
  chart: {
    plotBackgroundColor: undefined,
    plotBorderWidth: undefined,
    plotShadow: false,
    type: 'pie'
  },
  credits: {
    enabled: false
  },
  title: {
    text: ''
  },
  tooltip: {
    useHTML: true,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadow: {
      color: '#0000000A',
      offsetX: 6,
      offsetY: 0,
      opacity: 1,
      width: 12
    },
    style: {
      fontFamily: 'Haas Grot Text R, sans-serif',
      fontSize: '11px',
      lineHeight: '16px',
      letterSpacing: '0'
    },
    headerFormat: `
      <div style="
        font-weight: 500;
        margin-bottom: 16px;
        font-family: 'Haas Grot Text R', sans-serif;
      ">
        {point.name}
      </div>
    `,
    pointFormat: `
      <div style="display: flex; gap: 24px; align-items: center; justify-content: space-between; font-family: 'Haas Grot Text R', sans-serif;">
        <div style="font-weight: 400;">
          {point.y:.1f}%
        </div>
        <div style="font-weight: 400;">
          {point.value}
        </div>
      </div>
    `
  },
  plotOptions: {
    series: {
      states: { inactive: { opacity: 0.25 } }
    },
    pie: {
      innerSize: '70%',
      allowPointSelect: false,
      cursor: 'default',
      enableMouseTracking: true,
      borderWidth: 0,
      borderRadius: 0,
      borderColor: undefined,
      states: {
        hover: {
          enabled: true,
          shadow: false,
          halo: {
            size: 0
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      showInLegend: true,
      point: {
        events: {
          legendItemClick: function (this: Highcharts.Point): boolean {
            return false;
          }
        }
      }
    }
  },
  legend: { enabled: false },
  series: [
    {
      type: 'pie',
      borderWidth: 0,
      data: chartData
    }
  ]
});
