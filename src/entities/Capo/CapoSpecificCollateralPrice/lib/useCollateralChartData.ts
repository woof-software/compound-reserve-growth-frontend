import { useMemo } from 'react';

export interface CollateralPriceData {
  oracleAddress: string;
  oracleName: string;
  dateOfAggregation: number;
  capValue: string;
  assetId: number;
  price: string;
}

export interface CollateralChartSeries {
  name: string;
  data: Array<{ x: number; y: number }>;
}

interface UseCollateralChartDataConfig {
  rawData: CollateralPriceData[];
  groupBy?: 'oracle' | 'asset' | 'none';
  selectedOracle?: string;
  selectedAsset?: number;
}

export const useCollateralChartData = ({
  rawData,
  groupBy = 'none',
  selectedOracle,
  selectedAsset
}: UseCollateralChartDataConfig): {
  chartSeries: CollateralChartSeries[];
  hasData: boolean;
} => {
  const chartSeries = useMemo((): CollateralChartSeries[] => {
    if (!rawData?.length) return [];

    const filteredData = rawData.filter((item) => {
      if (selectedOracle && item.oracleAddress !== selectedOracle) return false;
      if (selectedAsset !== undefined && item.assetId !== selectedAsset)
        return false;
      return true;
    });

    if (!filteredData.length) return [];

    const shouldAggregate = groupBy === 'none';

    if (shouldAggregate) {
      const priceByDate = new Map<number, number>();
      const capByDate = new Map<number, number>();

      filteredData.forEach((item) => {
        const price = parseFloat(item.price);
        const cap = parseFloat(item.capValue);

        if (!isNaN(price)) {
          const dateKey = item.dateOfAggregation * 1000;
          priceByDate.set(dateKey, (priceByDate.get(dateKey) || 0) + price);
        }

        if (!isNaN(cap)) {
          const dateKey = item.dateOfAggregation * 1000;
          capByDate.set(dateKey, (capByDate.get(dateKey) || 0) + cap);
        }
      });

      const priceData = Array.from(priceByDate.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);

      const capData = Array.from(capByDate.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);

      return [
        { name: 'Collateral Price', data: priceData },
        { name: 'Collateral price limitation', data: capData }
      ];
    }

    const aggregatedData = new Map<
      string,
      {
        price: Map<number, number>;
        cap: Map<number, number>;
      }
    >();

    filteredData.forEach((item) => {
      const price = parseFloat(item.price);
      const cap = parseFloat(item.capValue);

      const key =
        groupBy === 'oracle' ? item.oracleName : `Asset ${item.assetId}`;

      if (!aggregatedData.has(key)) {
        aggregatedData.set(key, {
          price: new Map<number, number>(),
          cap: new Map<number, number>()
        });
      }

      const series = aggregatedData.get(key)!;
      const dateKey = item.dateOfAggregation * 1000;

      if (!isNaN(price)) {
        series.price.set(dateKey, (series.price.get(dateKey) || 0) + price);
      }

      if (!isNaN(cap)) {
        series.cap.set(dateKey, (series.cap.get(dateKey) || 0) + cap);
      }
    });

    const result: CollateralChartSeries[] = [];

    aggregatedData.forEach(({ price, cap }, name) => {
      result.push({
        name: `${name} - Collateral Price`,
        data: Array.from(price.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x - b.x)
      });

      result.push({
        name: `${name} - Collateral price limitation`,
        data: Array.from(cap.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x - b.x)
      });
    });

    return result;
  }, [rawData, groupBy, selectedOracle, selectedAsset]);

  const hasData = useMemo(
    () => chartSeries?.some((s) => s.data && s.data.length > 0),
    [chartSeries]
  );

  return { chartSeries, hasData };
};
