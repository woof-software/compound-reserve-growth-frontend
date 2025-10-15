import { CollateralChartSeries } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { filterForRange } from '@/shared/lib/utils/chart';

interface CollateralDataItem {
  Date: string;
  'Collateral Price': number;
}

interface CollateralLimitationDataItem {
  Date: string;
  'Collateral price limitation': number;
}

interface CsvDataItem {
  Date: string;
  'Collateral Price': number;
  'Collateral price limitation': number;
}

/**
 * This normalizer make csv data the same data represented in line chart
 * @param chartSeries
 * @param barSize
 */
export const getCsvData = (
  chartSeries: CollateralChartSeries[],
  barSize: 'D' | 'W' | 'M'
) => {
  const collateralPriceCsvData = filterForRange({
    data: chartSeries[0]?.data ?? [],
    getDate: (item) => new Date(item.x),
    transform: (item) => ({
      Date: new Date(item.x).toISOString().split('T')[0],
      'Collateral Price': item.y
    }),
    range: barSize
  });

  const collateralPriceLimitationCsvData = filterForRange({
    data: chartSeries[1]?.data ?? [],
    getDate: (item) => new Date(item.x),
    transform: (item) => ({
      Date: new Date(item.x).toISOString().split('T')[0],
      'Collateral price limitation': item.y
    }),
    range: barSize
  });

  return [
    ...collateralPriceCsvData,
    ...collateralPriceLimitationCsvData
  ].reduce(
    (
      acc: CsvDataItem[],
      currentValue: CollateralDataItem | CollateralLimitationDataItem
    ) => {
      const existing = acc.find((item) => item.Date === currentValue.Date);

      if (existing) {
        Object.assign(existing, currentValue);
      } else {
        acc.push({ ...currentValue } as CsvDataItem);
      }

      return acc;
    },
    []
  );
};
