import React, { FC, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Button from '@/shared/ui/Button/Button';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface CryptoChartProps {
  data: ChartData[];

  onClear: () => void;
}

const CryptoChart: FC<CryptoChartProps> = ({ data, onClear }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const maxValue = useMemo(
    () => (data.length ? Math.max(...data.map((item) => item.value)) : 0),
    [data]
  );

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      animation: false,
      style: {
        fontFamily: 'Inter, sans-serif'
      }
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
      lineWidth: 0.4,
      crosshair: {
        width: 1,
        color: '#7A8A99',
        dashStyle: 'Dash'
      }
    },
    yAxis: {
      type: 'logarithmic',
      max: maxValue,
      endOnTick: true,
      maxPadding: 0,
      title: {
        text: undefined
      },
      gridLineDashStyle: 'Dash',
      gridLineColor: 'var(--color-secondary-13)',
      gridLineWidth: 1,
      labels: {
        style: {
          fontSize: '11px',
          color: '#757682'
        },
        formatter: function () {
          const value = this.value as number;
          if (value >= 1000000) return value / 1000000 + 'M';
          if (value >= 1000) return value / 1000 + 'K';
          return value.toString();
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
        borderWidth: 0,
        states: {
          hover: {
            brightness: 0.15,
            animation: false
          }
        }
      },
      series: {
        stickyTracking: true,
        findNearestPointBy: 'x',
        cursor: 'pointer',
        enableMouseTracking: true,
        point: {
          events: {
            mouseOver: function () {
              this.setState('hover');
            },
            mouseOut: function () {
              this.setState('');
            }
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    tooltip: {
      outside: true,
      backgroundColor: 'rgba(18, 24, 47, 0.55)',
      borderColor: 'rgba(186, 187, 203, 0.2)',
      borderRadius: 4,
      borderWidth: 1,
      style: {
        color: '#FFFFFF',
        fontSize: '12px'
      },
      shared: true,
      useHTML: true,
      followPointer: false,
      hideDelay: 0,
      animation: false,
      positioner: function (labelWidth, labelHeight, point) {
        const chart = this.chart;
        const hoverPoint =
          chart.hoverPoint || (chart.hoverPoints && chart.hoverPoints[0]);

        if (hoverPoint && hoverPoint.graphic) {
          const barBBox = hoverPoint.graphic.getBBox();
          const x =
            chart.plotLeft + barBBox.x + barBBox.width / 2 - labelWidth / 2;
          const y = chart.plotTop + point.plotY - labelHeight - 10;
          return { x, y };
        }

        return {
          x: chart.plotLeft + point.plotX - labelWidth / 2,
          y: chart.plotTop + point.plotY - labelHeight - 10
        };
      },
      formatter: function () {
        const point = this.points?.[0];
        if (!point) return '';

        const name = point.key;
        const value = '$' + (point.y as number).toLocaleString();
        const color = point.color;

        return `
          <div>
            <p style="color: #BABBCB; font-weight: 600; font-size: 12px;">${name}</p>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; border-radius: 3px;"></span>
              <strong style="font-size: 12px;">${value}</strong>
            </div>
          </div>
        `;
      }
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

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
  }, [data]);

  return (
    <>
      <View.Condition if={Boolean(data.length > 1)}>
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
        />
      </View.Condition>
      <View.Condition if={Boolean(data.length <= 1)}>
        <div className='flex min-w-[400px] flex-col items-center justify-center gap-3.5'>
          <Text
            size='11'
            weight='500'
            className='text-secondary-32'
          >
            Select more options in order to see the Graph comparison
          </Text>
          <Button
            className='bg-aqua-green h-[36px] w-[108px] rounded-lg text-[11px] font-semibold'
            onClick={onClear}
          >
            Reset Filters
          </Button>
        </div>
      </View.Condition>
    </>
  );
};

export default CryptoChart;
