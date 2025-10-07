import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

export const getTotalMetricValues = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  let filteredData: CombinedIncentivesData[] = [];

  if (activeTab === 'Day') {
    const now = new Date();

    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    const tomorrow = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    );

    const todayTs = today.getTime() / 1000;
    const tomorrowTs = tomorrow.getTime() / 1000;

    const latestMap = new Map();

    for (const item of data) {
      if (item.date < todayTs || item.date > tomorrowTs) continue;

      latestMap.set(item.source.id, item);
    }

    filteredData = Array.from(latestMap.values());
  } else if (activeTab === 'Year') {
    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const endOfYear = new Date(Date.UTC(currentYear + 1, 0, 1));

    const startOfYearTs = startOfYear.getTime() / 1000;
    const endOfYearTs = endOfYear.getTime() / 1000;

    filteredData = data.filter((item) => {
      return item.date >= startOfYearTs && item.date <= endOfYearTs;
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
