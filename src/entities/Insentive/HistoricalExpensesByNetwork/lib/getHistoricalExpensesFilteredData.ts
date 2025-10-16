import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

type AggregatedDataPoint = {
  date: number;
  compoundPrice?: number;
  rewardsSupply: number;
  rewardsBorrow: number;
};

/**
 * This is the core data processing function.
 * It takes the raw API data and applies the filtering logic you specified.
 *
 * @param item - A single data object from the API.
 * @param mode - The selected mode ('Lend', 'Borrow', 'Total').
 * @param view - The selected view ('COMP', 'USD').
 * @returns The calculated value for a single data point.
 */
const calculateValue = (
  item: AggregatedDataPoint,
  mode: string,
  view: string
): number => {
  const { rewardsSupply, rewardsBorrow, compoundPrice } = item;
  const valueSupply = rewardsSupply || 0;
  const valueBorrow = rewardsBorrow || 0;

  let value: number;

  switch (mode) {
    case 'Lend':
      value = valueSupply;
      break;
    case 'Borrow':
      value = valueBorrow;
      break;
    case 'Total':
      value = valueSupply + valueBorrow;
      break;
    default:
      value = 0;
  }

  if (view === 'COMP') {
    if (!compoundPrice || compoundPrice <= 0) {
      return 0;
    }
    return value / compoundPrice;
  }

  return value;
};

/**
 * Groups raw data by network and date, then transforms it for charting.
 *
 * @param data - The entire array of data from the API.
 * @param mode - The selected mode ('Lend', 'Borrow', 'Total').
 * @param view - The selected view ('COMP', 'USD').
 * @returns An object where keys are network names and values are arrays of chart data points.
 */
export const getHistoricalExpensesFilteredData = (
  data: CombinedIncentivesData[],
  mode: string,
  view: string
): Record<string, { x: number; y: number }[]> => {
  if (!data || data.length === 0) {
    return {};
  }

  const aggregatedData = data.reduce((acc, item) => {
    const { network } = item.source;
    const { date, rewardsBorrow, rewardsSupply, compoundPrice } = item;

    if (!acc.has(network)) {
      acc.set(network, new Map());
    }
    const networkGroup = acc.get(network)!;

    if (!networkGroup.has(date)) {
      networkGroup.set(date, {
        date,
        compoundPrice,
        rewardsBorrow: 0,
        rewardsSupply: 0
      });
    }

    const dateEntry = networkGroup.get(date)!;
    dateEntry.rewardsBorrow += rewardsBorrow;
    dateEntry.rewardsSupply += rewardsSupply;

    return acc;
  }, new Map<string, Map<number, AggregatedDataPoint>>());

  const finalChartData: Record<string, { x: number; y: number }[]> = {};

  for (const [network, dateMap] of aggregatedData.entries()) {
    const chartPoints = Array.from(dateMap.values()).map((aggregatedItem) => {
      const yValue = calculateValue(aggregatedItem, mode, view);
      const xValue = aggregatedItem.date * 1000;

      return { x: xValue, y: yValue };
    });

    finalChartData[network] = chartPoints.sort((a, b) => a.x - b.x);
  }

  return finalChartData;
};
