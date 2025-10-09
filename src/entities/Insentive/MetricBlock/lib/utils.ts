import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

export const getTotalMetricValues = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  let filteredData: CombinedIncentivesData[] = [];

  if (activeTab === 'Day') {
    const now = Date.now() / 1000;
    const twentyFourHoursAgo = now - 36 * 60 * 60;

    const latestMap = new Map();

    for (const item of data) {
      if (item.date < twentyFourHoursAgo || item.date > now) continue;

      latestMap.set(item.source.id, item);
    }

    filteredData = Array.from(latestMap.values());
  } else if (activeTab === 'Year') {
    const now = new Date();
    now.setHours(23, 59, 59);
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0);
    targetDate.setDate(now.getDate() - 365);
    const targetTs =
      targetDate.getTime() / 1000 - targetDate.getTimezoneOffset() * 60;
    const nowTs = now.getTime() / 1000 - now.getTimezoneOffset() * 60;
    filteredData = data.filter((item) => {
      return item.date >= targetTs && item.date <= nowTs;
    });
  }

  return filteredData.reduce(
    (acc, curr) => {
      const { incomes, spends, compoundPrice } = curr;

      if (spends) {
        acc.totalLendIncentives += spends.valueSupply / compoundPrice;
        acc.totalLendIncentivesUsdPrice += spends.valueSupply;

        acc.totalBorrowIncentives += spends.valueBorrow / compoundPrice;
        acc.totalBorrowIncentivesUsdPrice += spends.valueBorrow;

        const total = spends.valueSupply + spends.valueBorrow;

        acc.totalIncentives += total / compoundPrice;
        acc.totalIncentivesUsdPrice += total;
      }

      const total = incomes.valueSupply + incomes.valueBorrow;

      acc.totalFeesGenerated += total / compoundPrice;
      acc.totalFeesGeneratedUsdPrice += total;

      return acc;
    },
    {
      totalLendIncentives: 0,
      totalLendIncentivesUsdPrice: 0,
      totalBorrowIncentives: 0,
      totalBorrowIncentivesUsdPrice: 0,
      totalIncentives: 0,
      totalIncentivesUsdPrice: 0,
      totalFeesGenerated: 0,
      totalFeesGeneratedUsdPrice: 0
    }
  );
};
