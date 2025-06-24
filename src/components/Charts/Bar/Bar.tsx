import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface CryptoChartProps {
  data: ChartData[];
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data }) => {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: data.map((item) => item.name),
      labels: {
        rotation: 0,
        style: {
          fontSize: '8px',
          color: '#757682'
        }
      },
      lineColor: '#7a8a99',
      lineWidth: 0.4
    },
    yAxis: {
      type: 'logarithmic',
      title: {
        text: undefined
      },
      gridLineDashStyle: 'Dot',
      gridLineColor: '#7a8a99',
      gridLineWidth: 1,
      labels: {
        style: {
          fontSize: '11px',
          color: '#757682'
        }
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0.02,
        borderWidth: 0
      }
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'column',
        name: 'Value',
        data: data.map((item) => ({
          y: item.value,
          color: item.color
        }))
      }
    ]
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
    />
  );
};

export default CryptoChart;
