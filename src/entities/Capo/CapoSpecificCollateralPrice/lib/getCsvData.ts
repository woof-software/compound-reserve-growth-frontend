import { CollateralChartSeries } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';

export const getCsvDataNormalizer = (
  chartSeries: CollateralChartSeries[],
  barSize: 'D' | 'W' | 'M'
) => {
  const collateralPriceData = chartSeries.find(
    (series) => series.name === 'Collateral Price'
  )?.data;
  const priceLimitationData = chartSeries.find(
    (series) => series.name === 'Collateral price limitation'
  )?.data;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!collateralPriceData || !priceLimitationData) {
    return [];
  }

  if (barSize === 'D') {
    return collateralPriceData.map((dataPoint, index) => ({
      Date: formatDate(new Date(dataPoint.x)),
      'Collateral Price': dataPoint.y,
      'Collateral price limitation': priceLimitationData[index].y
    }));
  }

  if (barSize === 'W' || barSize === 'M') {
    const aggregatedData: Record<
      string,
      {
        'Collateral Price': number;
        'Collateral price limitation': number;
        count: number;
      }
    > = {};

    collateralPriceData.forEach((dataPoint, index) => {
      const date = new Date(dataPoint.x);
      let key: string;

      if (barSize === 'W') {
        const dayOfWeek = date.getDay();
        const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const mondayDate = new Date(date);
        mondayDate.setDate(date.getDate() - distanceToMonday);
        key = formatDate(mondayDate);
      } else {
        key = formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
      }

      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          'Collateral Price': 0,
          'Collateral price limitation': 0,
          count: 0
        };
      }

      aggregatedData[key]['Collateral Price'] += dataPoint.y;
      aggregatedData[key]['Collateral price limitation'] +=
        priceLimitationData[index].y;
      aggregatedData[key].count += 1;
    });

    return Object.keys(aggregatedData).map((dateKey) => ({
      Date: dateKey,
      'Collateral Price':
        aggregatedData[dateKey]['Collateral Price'] /
        aggregatedData[dateKey].count,
      'Collateral price limitation':
        aggregatedData[dateKey]['Collateral price limitation'] /
        aggregatedData[dateKey].count
    }));
  }

  return [];
};
