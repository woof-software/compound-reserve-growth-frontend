import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { ChartDataItem, OptionType } from '@/shared/types';

import {
  CompoundRevenueFilterOptions,
  PreprocessedItem,
  PreprocessedResult
} from '../../types';

export function preprocessData(rawData: ChartDataItem[]): PreprocessedResult {
  const emptyResult: PreprocessedResult = {
    filterOptions: {
      chainOptions: [],
      marketOptions: [],
      sourceOptions: [],
      symbolOptions: []
    },
    processedItems: [],
    initialAggregatedData: [],
    sortedDates: []
  };

  if (!rawData || rawData.length === 0) {
    return emptyResult;
  }

  const uniqueValues = {
    chain: new Set<string>(),
    market: new Set<string>(),
    source: new Set<string>(),
    symbol: new Set<string>()
  };

  const processedItems: PreprocessedItem[] = [];
  const dailyTotals: Record<string, number> = {};

  for (const item of rawData) {
    const chain = item.source?.network || 'N/A';
    const market =
      item.source?.market === null ? 'no name' : item.source?.market || 'N/A';
    const source = item.source?.type || 'N/A';
    const symbol = item.source?.asset?.symbol || 'N/A';
    const date = new Date(item.date * 1000).toISOString().split('T')[0];

    uniqueValues.chain.add(chain);
    uniqueValues.market.add(market);
    uniqueValues.source.add(source);
    uniqueValues.symbol.add(symbol);

    processedItems.push({
      date,
      value: item.value,
      chain,
      market,
      source,
      symbol
    });
    dailyTotals[date] = (dailyTotals[date] || 0) + item.value;
  }

  const filterOptions: Partial<CompoundRevenueFilterOptions> = {};
  for (const key in uniqueValues) {
    const optionsKey = `${key}Options` as keyof CompoundRevenueFilterOptions;
    filterOptions[optionsKey] = Array.from(
      uniqueValues[key as keyof typeof uniqueValues]
    )
      .sort((a, b) => a.localeCompare(b))
      .map((value) => {
        const option: OptionType = {
          id: value,
          label: capitalizeFirstLetter(value)
        };

        if (key === 'market') {
          const matches =
            value === 'no name'
              ? rawData.filter((item) => item.source?.market == null)
              : rawData.filter((item) => item.source?.market === value);

          option.marketType = matches[0]?.source.type.split(' ')[1] ?? '';

          option.chain = Array.from(
            new Set(matches.map((item) => item.source.network))
          );
        }

        return option;
      });
  }

  const sortedDates = Object.keys(dailyTotals).sort();
  const initialAggregatedData = sortedDates.map((date) => ({
    date,
    value: dailyTotals[date]
  }));

  return {
    filterOptions: filterOptions as CompoundRevenueFilterOptions,
    processedItems,
    initialAggregatedData,
    sortedDates
  };
}

export const createIdSet = (options: OptionType[]): Set<string> =>
  new Set(options.map((opt) => opt.id));
