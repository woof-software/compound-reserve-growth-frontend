import { SeriesAreaOptions } from 'highcharts';

// TODO: FIX TYPES
export const getSummarizedCsvData = (aggregatedSeries: SeriesAreaOptions[]) => {
  const dateMap = new Map<string, any>();

  aggregatedSeries.forEach((network) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    network.data!.forEach(([timestamp, value]) => {
      const date = new Date(timestamp).toISOString().split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, { Date: date });
      }

      const entry = dateMap.get(date)!;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      entry[network.id] = value;
    });
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    a.Date.localeCompare(b.Date)
  );
};
