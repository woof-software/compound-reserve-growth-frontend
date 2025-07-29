import React, { useEffect, useMemo, useRef } from 'react';
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
  barCountToSet: number;
}

const CompoundRevenue: React.FC<CompoundRevenueProps> = ({
  data,
  barSize,
  barCountToSet
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const programmaticChange = useRef(false);

  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const aggregated = new Map<number, number>();

    data.forEach((item) => {
      const date = new Date(item.date);
      let keyDate;

      if (barSize === 'D') {
        keyDate = new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        );
      } else if (barSize === 'W') {
        const day = date.getUTCDay();
        const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
        keyDate = new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff)
        );
      } else {
        keyDate = new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
        );
      }

      const keyTimestamp = keyDate.getTime();
      const currentValue = aggregated.get(keyTimestamp) || 0;
      aggregated.set(keyTimestamp, currentValue + item.value);
    });

    return Array.from(aggregated.entries()).sort((a, b) => a[0] - b[0]);
  }, [data, barSize]);

  const dateTimeLabelFormats = {
    day: '%b %d',
    week: '%b %d',
    month: "%b '%y",
    year: '%Y'
  };

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      animation: false,
      panning: { enabled: true, type: 'x' },
      zooming: {
        mouseWheel: {
          enabled: true,
          type: 'x',
          sensitivity: 1.1,
          preventDefault: true
        },
        type: undefined,
        pinchType: undefined,
        resetButton: { theme: { display: 'none' } }
      }
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 75,
      dateTimeLabelFormats: dateTimeLabelFormats,
      labels: {
        style: { fontSize: '11px', color: '#7A8A99' }
      },
      lineWidth: 0,
      tickWidth: 0,
      crosshair: { width: 1, color: '#7A8A99', dashStyle: 'Dash' },
      events: {
        setExtremes: function (e) {
          if (programmaticChange.current) {
            programmaticChange.current = false;
            return;
          }

          if (e.trigger === 'zoom') {
            return;
          }

          if (e.min === undefined || e.max === undefined) return;
        }
      }
    },
    yAxis: {
      title: { text: undefined },
      gridLineDashStyle: 'Dash',
      gridLineColor: '#7A8A99',
      gridLineWidth: 0.5,
      labels: {
        style: { fontSize: '11px', color: '#7A8A99' },
        formatter: function () {
          const value = this.value as number;
          if (Math.abs(value) >= 1000000)
            return (value / 1000000).toFixed(1) + 'M';
          if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
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
        states: { hover: { animation: false, color: '#4DEDB5' } }
      }
    },
    credits: { enabled: false },
    tooltip: {
      outside: true,
      backgroundColor: 'rgba(18, 24, 47, 0.55)',
      borderColor: 'rgba(186, 187, 203, 0.2)',
      style: { color: '#FFFFFF', fontSize: '12px' },
      shared: true,
      useHTML: true,
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
        const value =
          '$' +
          (point.y as number).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        return `<div><p style="color: #BABBCB; font-weight: 600; font-size: 12px;">${date}</p><div style="display: flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 12px; height: 12px; background-color: #00D395; border-radius: 3px;"></span><span style="font-size: 10px;">Revenue</span><strong style="font-size: 12px;">${value}</strong></div></div>`;
      }
    },
    series: [
      {
        type: 'column',
        name: 'Revenue',
        data: aggregatedData,
        showInLegend: false
      }
    ],
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    rangeSelector: { enabled: false }
  };

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    chart.series[0].setData(aggregatedData, false);

    if (aggregatedData.length > 0 && barCountToSet > 0) {
      const dataLength = aggregatedData.length;
      const startIndex = Math.max(0, dataLength - barCountToSet);

      if (startIndex < dataLength) {
        const min = aggregatedData[startIndex][0];
        const max = aggregatedData[dataLength - 1][0];
        programmaticChange.current = true;
        chart.xAxis[0].setExtremes(min, max, true, false);
      } else {
        chart.redraw();
      }
    } else {
      chart.redraw();
    }
  }, [aggregatedData, barCountToSet]);

  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{ style: { width: '100%', height: '100%' } }}
    />
  );
};

export default CompoundRevenue;
