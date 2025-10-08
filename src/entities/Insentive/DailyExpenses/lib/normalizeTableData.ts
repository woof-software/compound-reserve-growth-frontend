import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

export const normalizeTableData = (
  filteredData: CombinedIncentivesData[],
  view: 'COMP' | 'USD'
) => {
  const groupedDataByNetworkDateAndMarket = filteredData.reduce((acc, item) => {
    const network = item.source.network;
    const date = item.date;
    const market = item.source.market;

    if (!acc.has(network)) {
      acc.set(network, new Map());
    }
    const networkGroup = acc.get(network)!;

    if (!networkGroup.has(date)) {
      networkGroup.set(date, new Map());
    }
    const dateGroup = networkGroup.get(date)!;

    if (!dateGroup.has(market!)) {
      dateGroup.set(market!, {
        ...item,
        spends: {
          id: item.spends?.id || 0,
          valueBorrow: 0,
          valueSupply: 0
        }
      });
    }

    const marketEntry = dateGroup.get(market!);

    if (item.spends && marketEntry) {
      marketEntry.spends!.valueBorrow += item.spends.valueBorrow;
      marketEntry.spends!.valueSupply += item.spends.valueSupply;
    }

    return acc;
  }, new Map<string, Map<number, Map<string, CombinedIncentivesData>>>());

  const calculateIncentive = (
    value: number,
    compoundPrice: number,
    view: string
  ): number => {
    if (view === 'COMP') {
      if (!compoundPrice || compoundPrice <= 0) {
        return 0;
      }
      return value / compoundPrice;
    }
    return value;
  };

  const result = Array.from(
    groupedDataByNetworkDateAndMarket.entries()
  ).flatMap(([network, networkMap]) => {
    return Array.from(networkMap.entries()).flatMap((item) => {
      return Array.from(item[1].entries()).map(([market, data]) => {
        const { spends, compoundPrice } = data;
        const lendValue = spends?.valueSupply || 0;
        const borrowValue = spends?.valueBorrow || 0;
        const total =
          view === 'COMP' && compoundPrice > 0
            ? (lendValue + borrowValue) / compoundPrice
            : lendValue + borrowValue;

        return {
          network: network,
          market: market,
          lendIncentive: calculateIncentive(lendValue, compoundPrice, view),
          borrowIncentive: calculateIncentive(borrowValue, compoundPrice, view),
          total: total,
          source: data.source
        };
      });
    });
  });

  return result;
};
