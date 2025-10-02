import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

export const getTotalMetricValues = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  let filteredData = [];

  if (activeTab === 'Day') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime() / 1000;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = tomorrow.getTime() / 1000;

    const latestMap = new Map();

    data.forEach((item) => {
      if (item.date >= todayTimestamp && item.date <= tomorrowTimestamp) {
        const source = item.source;
        if (!source) return;

        latestMap.set(source.id, item);
      }
    });

    filteredData = Array.from(latestMap.values());
  } else if (activeTab === 'Year') {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime() / 1000;
    const endOfYear =
      new Date(currentYear, 11, 31, 23, 59, 59).getTime() / 1000;

    filteredData = data.filter((item) => {
      return item.date >= startOfYear && item.date <= endOfYear;
    });
  }

  return filteredData.reduce(
    (acc, curr) => {
      return {
        totalLendIncentives: curr.compoundPrice
          ? (acc.totalLendIncentives || 0) +
            (curr?.spends?.valueSupply || 0) / curr.compoundPrice
          : 0,

        totalLendIncentivesUsdPrice:
          (acc.totalLendIncentivesUsdPrice || 0) +
          (curr?.spends?.valueSupply || 0),

        totalBorrowIncentives: curr.compoundPrice
          ? (acc.totalBorrowIncentives || 0) +
            (curr?.spends?.valueBorrow || 0) / curr.compoundPrice
          : 0,

        totalBorrowIncentivesUsdPrice:
          (acc.totalBorrowIncentivesUsdPrice || 0) +
          (curr?.spends?.valueBorrow || 0),

        totalIncentives: curr.compoundPrice
          ? (acc.totalIncentives || 0) +
            ((curr?.spends?.valueBorrow || 0) +
              (curr?.spends?.valueSupply || 0)) /
              curr.compoundPrice
          : 0,

        totalIncentivesUsdPrice:
          (acc.totalIncentivesUsdPrice || 0) +
          (curr?.spends?.valueSupply || 0) +
          (curr?.spends?.valueBorrow || 0),

        totalFeesGenerated: curr.compoundPrice
          ? (acc.totalFeesGenerated || 0) +
            ((curr?.incomes?.valueBorrow || 0) +
              (curr?.incomes?.valueSupply || 0)) /
              curr.compoundPrice
          : 0,

        totalFeesGeneratedUsdPrice:
          (acc.totalFeesGeneratedUsdPrice || 0) +
          (curr?.incomes?.valueBorrow || 0) +
          (curr?.incomes?.valueSupply || 0)
      };
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
