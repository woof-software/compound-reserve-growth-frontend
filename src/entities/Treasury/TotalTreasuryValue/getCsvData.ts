interface ChartSeries {
  x: number;
  y: number;
}

/**
 * This normalizer make csv data the same data represented in line chart and not summarize values
 * @param chartData
 * @param barSize
 */
export const getCsvData = (
  chartData: ChartSeries[],
  barSize: 'D' | 'W' | 'M'
) => {
  if (!chartData || chartData.length === 0) return [];

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (barSize === 'D') {
    return chartData.map((point) => ({
      Date: formatDate(new Date(point.x)),
      'Total treasury value': point.y
    }));
  }

  const grouped: Record<string, { x: number; y: number }> = {};

  chartData.forEach((point) => {
    const date = new Date(point.x);
    let key: string;

    if (barSize === 'W') {
      // Get Monday of the current week (start of week)
      const day = date.getUTCDay();
      const distanceToMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(date);
      monday.setUTCDate(date.getUTCDate() - distanceToMonday);
      monday.setUTCHours(0, 0, 0, 0);
      key = formatDate(monday);
    } else {
      // Start of month
      const firstOfMonth = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
      );
      key = formatDate(firstOfMonth);
    }

    // Keep the latest data point (same logic as chart)
    if (!grouped[key] || point.x > grouped[key].x) {
      grouped[key] = point;
    }
  });

  // Sort chronologically
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([dateKey, { y }]) => ({
      Date: dateKey,
      'Total treasury value': y
    }));
};
