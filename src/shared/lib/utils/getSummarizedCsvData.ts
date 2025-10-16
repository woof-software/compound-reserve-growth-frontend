import { SeriesAreaOptions, SeriesColumnOptions } from 'highcharts';

interface CsvRow {
  Date: string;
  [networkId: string]: string | number;
}

export const getSummarizedCsvData = <
  T extends SeriesAreaOptions | SeriesColumnOptions
>(
  aggregatedSeries: T[]
): CsvRow[] => {
  const dateMap = new Map<string, CsvRow>();

  aggregatedSeries.forEach((network) => {
    if (network.data && network.id) {
      // @ts-expect-error TODO: fix timestamp and value types
      network.data.forEach(([timestamp, value]) => {
        const date = new Date(timestamp).toISOString().split('T')[0];

        if (!dateMap.has(date)) {
          dateMap.set(date, { Date: date });
        }

        const entry = dateMap.get(date)!;
        entry[network.id!] = value;
      });
    }
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    a.Date.localeCompare(b.Date)
  );
};
