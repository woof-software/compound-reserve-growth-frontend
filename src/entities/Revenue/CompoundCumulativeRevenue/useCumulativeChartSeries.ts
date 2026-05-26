import type { LineChartSeries } from '@/components/Charts/Line/Line';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Per series: bucket by UTC day (sum y, ignore negative contributions),
 * then cumulative sum with one point per calendar day from first to last day.
 */
export function lineChartSeriesToUtcDayCumulative(dailySeries: LineChartSeries[]): LineChartSeries[] {
  if (!dailySeries.length) return [];

  return dailySeries.map((series) => {
    if (!series.data?.length) {
      return { ...series, data: [] };
    }

    const dailyTotals = new Map<number, number>();
    for (const point of series.data) {
      const date = new Date(point.x);
      date.setUTCHours(0, 0, 0, 0);
      const dayStartTimestamp = date.getTime();
      const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
      const valueToAdd = point.y < 0 ? 0 : point.y;
      dailyTotals.set(dayStartTimestamp, currentTotal + valueToAdd);
    }

    const sortedDailyPoints = Array.from(dailyTotals.entries())
      .map(([x, y]) => ({ x, y }))
      .sort((a, b) => a.x - b.x);

    if (sortedDailyPoints.length === 0) {
      return { ...series, data: [] };
    }

    const cumulativeData: { x: number; y: number }[] = [];
    const minDate = sortedDailyPoints[0].x;
    const maxDate = sortedDailyPoints[sortedDailyPoints.length - 1].x;

    let cumulativeSum = 0;
    let dataIndex = 0;

    for (let d = minDate; d <= maxDate; d += ONE_DAY_MS) {
      if (dataIndex < sortedDailyPoints.length && sortedDailyPoints[dataIndex].x === d) {
        cumulativeSum += sortedDailyPoints[dataIndex].y;
        dataIndex++;
      }
      cumulativeData.push({ x: d, y: cumulativeSum });
    }

    return {
      ...series,
      name: series.name.replace('Daily', 'Cumulative'),
      data: cumulativeData,
    };
  });
}
