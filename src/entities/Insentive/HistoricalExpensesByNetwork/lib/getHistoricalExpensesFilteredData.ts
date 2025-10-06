import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

/**
 * This is the core data processing function.
 * It takes the raw API data and applies the filtering logic you specified.
 *
 * @param item - A single data object from the API.
 * @param mode - The selected mode ('Lend', 'Borrow', 'Total').
 * @param view - The selected view ('COMP', 'USD').
 * @returns The calculated value for a single data point.
 */
const calculateValue = (item: any, mode: string, view: string): number => {
  const { spends, compoundPrice } = item;
  const valueSupply = spends?.valueSupply || 0;
  const valueBorrow = spends?.valueBorrow || 0;

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
 * Groups the raw data by network and calculates the value for each entry.
 *
 * @param data - The entire array of data from the API.
 * @param mode - The selected mode.
 * @param view - The selected view.
 * @returns An object where keys are network names and values are arrays of chart data points.
 */
export const getHistoricalExpensesFilteredData = (
  data: CombinedIncentivesData[],
  mode: string,
  view: string
): Record<string, { x: number; y: number }[]> => {
  if (!data) {
    return {};
  }

  const groupedByDate = data.reduce(
    (acc, currentItem) => {
      const { date, incomes, spends } = currentItem;

      if (!acc[date]) {
        acc[date] = {
          ...currentItem,
          incomes: { ...incomes },
          spends: spends
            ? { ...spends }
            : { id: 0, valueBorrow: 0, valueSupply: 0 }
        };
      } else {
        acc[date].incomes.valueBorrow += incomes.valueBorrow;
        acc[date].incomes.valueSupply += incomes.valueSupply;

        if (spends) {
          acc[date].spends!.valueBorrow += spends.valueBorrow;
          acc[date].spends!.valueSupply += spends.valueSupply;
        }
      }

      return acc;
    },
    {} as Record<number, CombinedIncentivesData>
  );

  return Object.values(groupedByDate).reduce(
    (acc: Record<string, { x: number; y: number }[]>, item) => {
      const network = item.source.network;

      if (!acc[network]) {
        acc[network] = [];
      }

      const yValue = calculateValue(item, mode, view);
      const xValue = item.date * 1000;

      acc[network].push({ x: xValue, y: yValue });

      return acc;
    },
    {}
  );
};
