import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import ChartLegends from '@/components/Charts/ChartLegends';
import { cn } from '@/shared/lib/classNames/classNames';
import { colorPicker } from '@/shared/lib/utils/utils';
import Text from '@/shared/ui/Text/Text';

interface PieDataItem {
  name: string;
  percent: number;
  value: string;
  color?: string;
}

interface PieChartProps {
  data: PieDataItem[];
  isResponse?: boolean;
  responseOptions?: Highcharts.ResponsiveOptions;
  className?: string;
  hiddenItems?: Set<string>;
  onLegendClick?: (name: string) => void;
}

const PieChart: FC<PieChartProps> = ({
  data,
  className,
  hiddenItems: externalHiddenItems,
  onLegendClick,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [internalHiddenItems, setInternalHiddenItems] = useState<Set<string>>(
    new Set(),
  );
  const [hc, setHc] = useState<Highcharts.Chart | null>(null);

  const hiddenItems = useMemo(
    () => externalHiddenItems || internalHiddenItems,
    [externalHiddenItems, internalHiddenItems],
  );

  const findPointByName = useCallback(
    (name: string) =>
      hc?.series?.[0]?.points.find(
        (p) => p.name === name && p.visible !== false,
      ),
    [hc],
  );

  const highlightPoint = useCallback(
    (name: string) => {
      const pt = findPointByName(name);
      if (!pt) return;
      pt.series.points.forEach((p) =>
        p.setState(p === pt ? 'hover' : 'inactive'),
      );
      hc?.tooltip?.refresh(pt);
    },
    [hc, findPointByName],
  );

  const clearHighlight = useCallback(() => {
    const s = hc?.series?.[0];
    if (!s) return;
    s.points.forEach((p) => p.setState(''));
    hc?.tooltip?.hide(0);
  }, [hc]);

  useMemo(() => {
    setInternalHiddenItems(new Set());
  }, [data]);

  const chartData = useMemo(() => {
    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));
    const totalVisiblePercent = visibleItems.reduce(
      (sum, item) => sum + item.percent,
      0,
    );

    return data.map((el, index) => {
      const isVisible = !hiddenItems.has(el.name);
      const newPercent =
        isVisible && totalVisiblePercent > 0
          ? (el.percent / totalVisiblePercent) * 100
          : 0;

      return {
        name: el.name,
        y: newPercent,
        value: el.value,
        color: el.color || colorPicker(index),
        visible: isVisible,
      };
    });
  }, [data, hiddenItems]);

  const legends = useMemo(
    () =>
      chartData.map((item) => ({
        id: item.name,
        name: item.name,
        color: item.color,
        isDisabled: !item.visible,
      })),
    [chartData],
  );

  const areAllSeriesHidden = useMemo(() => {
    if (!data || data.length === 0) return false;
    return hiddenItems.size === data.length;
  }, [data, hiddenItems]);

  const shouldShowNoDataMessage = useMemo(() => {
    if (!data || data.length === 0) return true;
    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));
    return (
      visibleItems.length === 0 ||
      visibleItems.every((item) => item.percent === 0)
    );
  }, [data, hiddenItems]);

  const isLastActiveLegend = useMemo(() => {
    return chartData.filter((el) => el.visible).length === 1;
  }, [chartData]);

  const onLegendItemClick = (itemName: string) => {
    if (onLegendClick) {
      onLegendClick(itemName);
      return;
    }

    if (isLastActiveLegend && !hiddenItems.has(itemName)) return;

    setInternalHiddenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  const options = {
    chart: {
      plotBackgroundColor: undefined,
      plotBorderWidth: undefined,
      plotShadow: false,
      type: 'pie',
    },
    credits: {
      enabled: false,
    },
    title: {
      text: '',
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
        width: 12,
      },
      style: {
        fontFamily: 'Haas Grot Text R, sans-serif',
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0',
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
    `,
    },
    plotOptions: {
      series: {
        states: { inactive: { opacity: 0.25 } },
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
              size: 0,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        point: {
          events: {
            legendItemClick: function (this: Highcharts.Point): boolean {
              return false;
            },
          },
        },
      },
    },
    legend: { enabled: false },
    series: [
      {
        type: 'pie',
        borderWidth: 0,
        data: chartData,
      },
    ],
  };

  return (
    <div className={cn('highcharts-container relative', className)}>
      {areAllSeriesHidden && (
        <Text
          size="11"
          className="text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        >
          All series are hidden
        </Text>
      )}
      {!areAllSeriesHidden && shouldShowNoDataMessage && (
        <Text
          size="11"
          className="text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        >
          All visible values are zero
        </Text>
      )}
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        callback={(chart: any) => setHc(chart)}
        containerProps={{ style: { width: '100%', maxHeight: '350px' } }}
      />
      {(!areAllSeriesHidden && !shouldShowNoDataMessage) && (
        <ChartLegends
          legends={legends}
          onLegendClick={onLegendItemClick}
          onLegendHover={highlightPoint}
          onLegendLeave={clearHighlight}
        />
      )}
    </div>
  );
};

export default PieChart;
