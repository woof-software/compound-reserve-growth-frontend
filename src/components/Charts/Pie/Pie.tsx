import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import PieChartLegend from '@/components/Charts/Pie/PieChartLegend';
import { getPieChartOptions } from '@/components/Charts/Pie/pieChartOptions';
import { cn } from '@/shared/lib/classNames/classNames';
import { colorPicker } from '@/shared/lib/utils/utils';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

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
}

const PieChart: FC<PieChartProps> = ({ data, className }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [hc, setHc] = useState<Highcharts.Chart | null>(null);

  const findPointByName = useCallback(
    (name: string) =>
      hc?.series?.[0]?.points.find(
        (p) => p.name === name && p.visible !== false
      ),
    [hc]
  );

  const highlightPoint = useCallback(
    (name: string) => {
      const pt = findPointByName(name);
      if (!pt) return;
      pt.series.points.forEach((p) =>
        p.setState(p === pt ? 'hover' : 'inactive')
      );
      hc?.tooltip?.refresh(pt);
    },
    [hc, findPointByName]
  );

  const clearHighlight = useCallback(() => {
    const s = hc?.series?.[0];
    if (!s) return;
    s.points.forEach((p) => p.setState(''));
    hc?.tooltip?.hide(0);
  }, [hc]);

  useMemo(() => {
    setHiddenItems(new Set());
  }, [data]);

  const chartData = useMemo(() => {
    const visibleItems = data.filter((item) => !hiddenItems.has(item.name));
    const totalVisiblePercent = visibleItems.reduce(
      (sum, item) => sum + item.percent,
      0
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
        visible: isVisible
      };
    });
  }, [data, hiddenItems]);

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
    if (isLastActiveLegend && !hiddenItems.has(itemName)) return;
    setHiddenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  const options = getPieChartOptions(
    chartData as unknown as Highcharts.PointOptionsObject[]
  );

  return (
    <div className={cn('highcharts-container relative', className)}>
      {areAllSeriesHidden && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        >
          All series are hidden
        </Text>
      )}
      {!areAllSeriesHidden && shouldShowNoDataMessage && (
        <Text
          size='11'
          className='text-primary-14 pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
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
      <View.Condition
        if={Boolean(!areAllSeriesHidden && !shouldShowNoDataMessage)}
      >
        <PieChartLegend
          data={chartData}
          hiddenItems={hiddenItems}
          isLastActiveLegend={isLastActiveLegend}
          onItemClick={onLegendItemClick}
          onItemHover={highlightPoint}
          onItemLeave={clearHighlight}
        />
      </View.Condition>
    </div>
  );
};

export default PieChart;
