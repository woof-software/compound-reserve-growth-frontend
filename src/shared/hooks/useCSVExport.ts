import { useMemo } from 'react';

interface SeriesData {
  name: string;
  data: { x: number; y: number }[];
}

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

interface UseCSVExportProps {
  chartSeries?: SeriesData[];
  stackedData?: StackedChartData[];
  barSize: 'D' | 'W' | 'M';
  groupBy: string;
  filePrefix: string;
  aggregationType?: 'sum' | 'last';
  rawData?: any[];
  selectedChains?: { id: string; label: string }[];
  selectedMarkets?: { id: string; label: string }[];
  groupByPathMapping?: Record<string, string>;
  getValueByPath?: (obj: any, path: string) => any;
}

export const useCSVExport = ({
  chartSeries,
  stackedData,
  barSize,
  groupBy,
  filePrefix,
  aggregationType = 'sum',
  rawData,
  selectedChains = [],
  selectedMarkets = [],
  groupByPathMapping,
  getValueByPath
}: UseCSVExportProps) => {
  const csvData = useMemo(() => {
    if (stackedData && stackedData.length > 0) {
      if (barSize === 'D') {
        return stackedData.map((row) => {
          const csvRow: Record<string, string | number> = { Date: row.date };
          Object.keys(row).forEach((key) => {
            if (key !== 'date') {
              csvRow[key] = row[key];
            }
          });
          return csvRow;
        });
      }

      if (!rawData || !getValueByPath || !groupByPathMapping) {
        return [];
      }

      const selectedChainSet = new Set(selectedChains.map((c) => c.id));
      const selectedMarketSet = new Set(selectedMarkets.map((m) => m.id));
      const isChainFilterActive = selectedChainSet.size > 0;
      const isMarketFilterActive = selectedMarketSet.size > 0;

      const filteredData = rawData
        .filter((item) => {
          const network = item.source.network;
          const marketName = item.source.market ?? 'no name';
          const chainMatch =
            !isChainFilterActive || selectedChainSet.has(network);
          const marketMatch =
            !isMarketFilterActive || selectedMarketSet.has(marketName);
          return chainMatch && marketMatch;
        })
        .sort((a, b) => a.date - b.date);

      const pointsPerBar = { D: 1, W: 7, M: 30 };
      const chunkSize = pointsPerBar[barSize];
      const groupedByDate: { [date: string]: StackedChartData } = {};
      const groupByKeyPath = groupByPathMapping[groupBy];

      for (let i = 0; i < filteredData.length; i += chunkSize) {
        const chunk = filteredData.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        const firstPointDate = new Date(chunk[0].date * 1000);

        const date =
          barSize === 'M'
            ? new Date(
                firstPointDate.getFullYear(),
                firstPointDate.getMonth(),
                1
              )
                .toISOString()
                .split('T')[0]
            : barSize === 'W'
              ? (() => {
                  const dayOfWeek = firstPointDate.getUTCDay();
                  const diff =
                    firstPointDate.getUTCDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1);
                  const startOfWeek = new Date(firstPointDate);
                  startOfWeek.setUTCDate(diff);
                  return startOfWeek.toISOString().split('T')[0];
                })()
              : firstPointDate.toISOString().split('T')[0];

        if (!groupedByDate[date]) {
          groupedByDate[date] = { date };
        }

        for (const item of chunk) {
          let seriesKey: string;
          if (groupBy === 'None') {
            seriesKey = 'Total';
          } else {
            seriesKey = getValueByPath(item, groupByKeyPath) || 'Unknown';
          }

          groupedByDate[date][seriesKey] =
            ((groupedByDate[date][seriesKey] as number) || 0) + item.value;
        }
      }

      const aggregatedData = Object.values(groupedByDate).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return aggregatedData.map((row) => {
        const csvRow: Record<string, string | number> = { Date: row.date };
        Object.keys(row).forEach((key) => {
          if (key !== 'date') {
            csvRow[key] = row[key];
          }
        });
        return csvRow;
      });
    }

    if (!chartSeries || chartSeries.length === 0) return [];

    if (barSize === 'D') {
      const allDates = new Set<number>();
      chartSeries.forEach((series) => {
        series.data.forEach((point) => allDates.add(point.x));
      });

      const sortedDates = Array.from(allDates).sort();

      return sortedDates.map((timestamp) => {
        const csvRow: Record<string, string | number> = {
          Date: new Date(timestamp).toISOString().split('T')[0]
        };

        chartSeries.forEach((series) => {
          const point = series.data.find((p) => p.x === timestamp);
          csvRow[series.name] = point ? point.y : '';
        });

        return csvRow;
      });
    }

    const pointsPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = pointsPerBar[barSize];
    const allDates = new Set<number>();
    const seriesDataMap = new Map<string, Map<number, number>>();

    chartSeries.forEach((series) => {
      const aggregatedData = new Map<number, number>();

      for (let i = 0; i < series.data.length; i += chunkSize) {
        const chunk = series.data.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        const firstPoint = chunk[0];
        const firstPointDate = new Date(firstPoint.x);

        const periodTimestamp =
          barSize === 'M'
            ? new Date(
                firstPointDate.getFullYear(),
                firstPointDate.getMonth(),
                1
              ).getTime()
            : barSize === 'W'
              ? (() => {
                  const dayOfWeek = firstPointDate.getUTCDay();
                  const diff =
                    firstPointDate.getUTCDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1);
                  const startOfWeek = new Date(firstPointDate);
                  startOfWeek.setUTCDate(diff);
                  return startOfWeek.getTime();
                })()
              : firstPoint.x;

        let aggregatedValue: number;
        if (aggregationType === 'last') {
          const lastPoint = chunk[chunk.length - 1];
          aggregatedValue = lastPoint.y;
        } else {
          aggregatedValue = chunk.reduce((sum, point) => sum + point.y, 0);
        }

        aggregatedData.set(periodTimestamp, aggregatedValue);
        allDates.add(periodTimestamp);
      }

      seriesDataMap.set(series.name, aggregatedData);
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((timestamp) => {
      const csvRow: Record<string, string | number> = {
        Date: new Date(timestamp).toISOString().split('T')[0]
      };

      seriesDataMap.forEach((data, seriesName) => {
        csvRow[seriesName] = data.get(timestamp) || '';
      });

      return csvRow;
    });
  }, [
    chartSeries,
    stackedData,
    barSize,
    aggregationType,
    rawData,
    selectedChains,
    selectedMarkets,
    groupBy,
    groupByPathMapping,
    getValueByPath
  ]);

  const csvFilename = useMemo(() => {
    const timeframe =
      barSize === 'D' ? 'Daily' : barSize === 'W' ? 'Weekly' : 'Monthly';

    let groupByText: string;
    if (groupBy === 'none' || groupBy === 'None') {
      groupByText = 'Total';
    } else if (groupBy === 'market' || groupBy === 'Market') {
      groupByText = 'Market';
    } else if (groupBy === 'network' || groupBy === 'Chain') {
      groupByText = 'Chain';
    } else {
      groupByText = groupBy.replace(/\s+/g, '_');
    }

    return `${filePrefix}_${timeframe}_${groupByText}.csv`;
  }, [barSize, groupBy, filePrefix]);

  return {
    csvData,
    csvFilename
  };
};
