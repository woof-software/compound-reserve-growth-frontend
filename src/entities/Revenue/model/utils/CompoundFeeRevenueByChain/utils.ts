import {
  PrecomputedViews,
  PrecomputedViewType,
  ProcessedRevenueData
} from '@/entities/Revenue';
import { longMonthNames, shortMonthNames } from '@/shared/consts';
import { capitalizeFirstLetter, formatCurrencyValue } from '@/shared/lib/utils';
import { ChartDataItem } from '@/shared/types';

export function precomputeViews(
  rawData: ChartDataItem[]
): PrecomputedViews | null {
  if (!rawData || rawData.length === 0) {
    return null;
  }

  const aggregated = {
    quarterly: {} as Record<string, Record<string, Record<string, number>>>,
    monthly: {} as Record<string, Record<string, Record<string, number>>>,
    weekly: {} as Record<string, Record<string, Record<string, number>>>
  };

  const allChains = new Set<string>();
  const allPeriods = {
    quarterly: new Set<string>(),
    monthly: new Set<string>(),
    weekly: new Set<string>()
  };

  for (const item of rawData) {
    const chain = capitalizeFirstLetter(item.source.network);
    allChains.add(chain);

    const date = new Date(item.date * 1000);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const value = item.value;

    const quarterPeriod = String(year);
    const quarterKey = `Q${Math.floor(month / 3) + 1}`;
    allPeriods.quarterly.add(quarterPeriod);

    const monthPeriod = `${year} ${month < 6 ? 'Jan-Jun' : 'Jul-Dec'}`;
    const monthKey = shortMonthNames[month];
    allPeriods.monthly.add(monthPeriod);

    const weekPeriod = `${longMonthNames[month]} ${year}`;
    const weekKey = `Week ${Math.ceil(day / 7)}`;
    allPeriods.weekly.add(weekPeriod);

    const updateAggregation = (
      store: Record<string, Record<string, Record<string, number>>>,
      period: string,
      key: string
    ) => {
      store[period] = store[period] || {};
      store[period][chain] = store[period][chain] || {};
      store[period][chain][key] = (store[period][chain][key] || 0) + value;
    };

    updateAggregation(aggregated.quarterly, quarterPeriod, quarterKey);
    updateAggregation(aggregated.monthly, monthPeriod, monthKey);
    updateAggregation(aggregated.weekly, weekPeriod, weekKey);
  }

  const chains = Array.from(allChains).sort();
  const precomputed: PrecomputedViews = {
    quarterly: {},
    monthly: {},
    weekly: {}
  };

  const createView = (
    dataForPeriod: Record<string, Record<string, number>>,
    allKeys: string[]
  ): PrecomputedViewType => {
    const tableData: ProcessedRevenueData[] = [];
    const totals: { [key: string]: number } = {};

    for (const chain of chains) {
      const row: ProcessedRevenueData = { chain };
      let hasData = false;
      const chainData = dataForPeriod ? dataForPeriod[chain] || {} : {};

      for (const key of allKeys) {
        const val = chainData[key] || 0;
        row[key] = val;
        totals[key] = (totals[key] || 0) + val;
        if (val !== 0) hasData = true;
      }

      if (hasData) {
        tableData.push(row);
      }
    }

    return {
      tableData,
      totals,
      columns: allKeys.map((k) => ({
        accessorKey: k,
        header: k,
        cell: ({ getValue }) => formatCurrencyValue(getValue() as number)
      }))
    };
  };

  for (const period of allPeriods.quarterly) {
    precomputed.quarterly[period] = createView(aggregated.quarterly[period], [
      'Q1',
      'Q2',
      'Q3',
      'Q4'
    ]);
  }

  for (const period of allPeriods.monthly) {
    const months = period.includes('Jan-Jun')
      ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']
      : ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    precomputed.monthly[period] = createView(
      aggregated.monthly[period],
      months
    );
  }

  for (const period of allPeriods.weekly) {
    const dataForPeriod = aggregated.weekly[period];
    if (!dataForPeriod) continue;

    const weekKeysSet = new Set<string>();
    for (const chainData of Object.values(dataForPeriod)) {
      for (const key of Object.keys(chainData)) {
        weekKeysSet.add(key);
      }
    }
    const sortedWeekKeys = Array.from(weekKeysSet).sort(
      (a, b) =>
        parseInt(a.replace('Week ', '')) - parseInt(b.replace('Week ', ''))
    );
    precomputed.weekly[period] = createView(dataForPeriod, sortedWeekKeys);
  }

  return precomputed;
}

export const generateOptions = (
  views: PrecomputedViews | null,
  interval: string
) => {
  if (!views) return { label: 'Year', options: [] };
  switch (interval) {
    case 'Quarterly':
      return {
        label: 'Year',
        options: Object.keys(views.quarterly).sort(
          (a, b) => parseInt(b) - parseInt(a)
        )
      };
    case 'Monthly':
      return {
        label: 'Period',
        options: Object.keys(views.monthly).sort((a, b) => {
          const yearA = a.substring(0, 4);
          const yearB = b.substring(0, 4);
          if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
          return a.includes('Jan-Jun') ? -1 : 1;
        })
      };
    case 'Weekly':
      return {
        label: 'Month',
        options: Object.keys(views.weekly).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )
      };
    default:
      return { label: 'Period', options: [] };
  }
};
