import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
type NormalizedData = {
  network: string;
  valueComp: number;
  valueUsd: number;
};
type TabType = 'lend' | 'borrow' | 'total';

export const tableDataNormalizer = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  const getTabValues = (item: CombinedIncentivesData) => {
    const { valueSupply = 0, valueBorrow = 0 } = item?.spends || {};
    const { compoundPrice = 0 } = item;

    const safeComp = (usdValue: number) =>
      compoundPrice > 0 ? usdValue / compoundPrice : 0;

    const values = {
      lend: {
        usd: valueSupply,
        comp: safeComp(valueSupply)
      },
      borrow: {
        usd: valueBorrow,
        comp: safeComp(valueBorrow)
      },
      total: {
        usd: valueSupply + valueBorrow,
        comp: safeComp(valueSupply + valueBorrow)
      }
    };

    const normalizedTab = activeTab.toLowerCase() as TabType;
    return values[normalizedTab] || values.total;
  };

  const latestDate = Math.max(
    ...data.map((item: { date: number }) => item.date)
  );

  return data
    .filter((item: { date: number }) => item.date === latestDate)
    .reduce((acc, currentItem) => {
      const { usd, comp } = getTabValues(currentItem);
      const network = currentItem.source.network;

      const existing = acc.find((item) => item.network === network);

      if (existing) {
        existing.valueComp += comp;
        existing.valueUsd += usd;
      } else {
        acc.push({
          network: network,
          valueComp: comp,
          valueUsd: usd
        });
      }

      return acc;
    }, [] as NormalizedData[]);
};
