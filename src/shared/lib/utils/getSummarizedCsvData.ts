import { SeriesAreaOptions, SeriesColumnOptions } from 'highcharts';

export function getSummarizedCsvData(
  aggregatedSeries: Array<SeriesAreaOptions | SeriesColumnOptions>
): Record<string, string>[] {
  const dateMap = new Map<string, Record<string, string>>();

  aggregatedSeries.forEach((network) => {
    const { data, id: chain } = network;

    if (!data || !chain) return;

    data.forEach((record) => {
      if (!Array.isArray(record)) return;

      const [timestamp, value] = record;

      if (typeof timestamp !== 'number') return;

      const date = new Date(timestamp).toISOString().split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, { Date: date });
      }

      const entry = dateMap.get(date)!;

      entry[chain] = `${value}`;
    });
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    a.Date.localeCompare(b.Date)
  );
}
