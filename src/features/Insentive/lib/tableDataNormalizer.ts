import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

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
    return values[normalizedTab];
  };

  const latestDate = Math.max(
    ...data.map((item: { date: number }) => item.date)
  );

  return data
    .filter((item: { date: number }) => item.date === latestDate)
    .map((item) => {
      const { usd, comp } = getTabValues(item);

      return {
        network: item.source.network,
        valueComp: comp,
        valueUsd: usd,
        source: item.source
      };
    });
};
