import React, { FC, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import 'highcharts/modules/stock';
import 'highcharts/modules/mouse-wheel-zoom';

interface ChartData {
  date: string;
  value: number;
}

interface CompoundRevenueProps {
  data: ChartData[];
  barSize: 'D' | 'W' | 'M';
  barCount: number;
}

const CompoundRevenue: FC<CompoundRevenueProps> = ({
  data,
  barSize,
  barCount
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const fullAggregatedData = useMemo(() => {
    const daysPerBar = {
      D: 1,
      W: 7,
      M: 30
    };

    const chunkSize = daysPerBar[barSize];
    const result: [number, number][] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;

      const sum = chunk.reduce((acc, item) => acc + item.value, 0);
      const timestamp = new Date(chunk[chunk.length - 1].date).getTime();
      result.push([timestamp, sum]);
    }

    return result;
  }, [data, barSize]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      animation: false,
      panning: {
        enabled: true,
        type: 'x'
      },
      zooming: {
        mouseWheel: {
          enabled: true,
          type: 'x',
          sensitivity: 1.1,
          preventDefault: true
        },
        type: undefined,
        pinchType: undefined,
        resetButton: {
          theme: {
            display: 'none'
          }
        }
      }
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      labels: {
        style: {
          fontSize: '11px',
          color: '#7A8A99'
        }
      },
      lineWidth: 0,
      tickWidth: 0,
      crosshair: {
        width: 1,
        color: '#7A8A99',
        dashStyle: 'Dash'
      },
      events: {
        setExtremes: function (e) {
          if (e.trigger === 'navigator' || e.trigger === 'rangeSelector') {
            return;
          }
        }
      }
    },
    yAxis: {
      title: { text: undefined },
      gridLineDashStyle: 'Dash',
      gridLineColor: '#7A8A99',
      gridLineWidth: 0.5,
      labels: {
        style: {
          fontSize: '11px',
          color: '#7A8A99'
        },
        formatter: function () {
          const value = this.value as number;
          if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        }
      },
      lineWidth: 0
    },
    legend: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0.1,
        borderWidth: 0,
        color: '#00D395',
        states: {
          hover: {
            animation: false,
            color: '#4DEDB5'
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
    credits: { enabled: false },
    tooltip: {
      outside: true,
      backgroundColor: 'rgba(18, 24, 47, 0.55)',
      borderColor: 'rgba(186, 187, 203, 0.2)',
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

        let dateFormat;
        switch (barSize) {
          case 'D':
            dateFormat = '%b %d, %Y';
            break;
          case 'W':
            dateFormat = 'Week of %b %d, %Y';
            break;
          case 'M':
            dateFormat = '%B %Y';
            break;
          default:
            dateFormat = '%b %d, %Y';
        }

        const date = Highcharts.dateFormat(dateFormat, point.x);
        const value = '$' + (point.y as number).toLocaleString();
        return `
          <div>
            <p style="color: #BABBCB; font-weight: 600; font-size: 12px;">${date}</p>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 12px; height: 12px; background-color: #00D395; border-radius: 3px;"></span>
              <span style="font-size: 10px;">Revenue</span>
              <strong style="font-size: 12px;">${value}</strong>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        type: 'column',
        name: 'Revenue',
        data: fullAggregatedData,
        showInLegend: false
      }
    ],
    navigator: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    },
    rangeSelector: {
      enabled: false
    }
  };

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart || fullAggregatedData.length === 0) {
      return;
    }

    chart.series[0].setData(fullAggregatedData, false);

    const dataLength = fullAggregatedData.length;
    const startIndex = Math.max(0, dataLength - barCount);

    if (startIndex < dataLength) {
      const min = fullAggregatedData[startIndex][0];
      const max = fullAggregatedData[dataLength - 1][0];

      chart.xAxis[0].setExtremes(min, max, true, false);
    } else {
      chart.redraw();
    }
  }, [fullAggregatedData, barCount]);
  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{
        style: {
          width: '100%',
          height: '100%'
        }
      }}
    />
  );
};

export default CompoundRevenue;
