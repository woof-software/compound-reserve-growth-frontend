import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

type GroupedData = {
  rewardsSupply: number;
  rewardsBorrow: number;
  income: number;
  compoundPrice: number;
};

export const getTotalMetricValues = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  let filteredData: CombinedIncentivesData[] = [];

  if (activeTab === 'Day') {
    let latestDate: number | null = null;

    for (const item of data) {
      if (latestDate === null || item.date > latestDate) {
        latestDate = item.date;
      }
    }

    if (latestDate !== null) {
      filteredData = data.filter((item) => item.date === latestDate);
    }
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

  const groupedByNetworkAndDate = filteredData.reduce((acc, item) => {
    const key = `${item.source.network}_${item.date}`;

    if (!acc.has(key)) {
      acc.set(key, {
        rewardsSupply: 0,
        rewardsBorrow: 0,
        income: 0,
        compoundPrice: item.compoundPrice
      });
    }

    const entry = acc.get(key)!;
    entry.rewardsSupply += item.rewardsSupply;
    entry.rewardsBorrow += item.rewardsBorrow;

    if (item.income > 0) {
      entry.income += item.income;
    }

    return acc;
  }, new Map<string, GroupedData>());

  return Array.from(groupedByNetworkAndDate.values()).reduce(
    (acc, curr) => {
      const { income, rewardsBorrow, rewardsSupply, compoundPrice } = curr;

      acc.totalLendIncentives += rewardsSupply / compoundPrice;
      acc.totalLendIncentivesUsdPrice += rewardsSupply;

      acc.totalBorrowIncentives += rewardsBorrow / compoundPrice;
      acc.totalBorrowIncentivesUsdPrice += rewardsBorrow;

      const total = rewardsSupply + rewardsBorrow;

      acc.totalIncentives += total / compoundPrice;
      acc.totalIncentivesUsdPrice += total;

      acc.totalFeesGenerated += income / compoundPrice;
      acc.totalFeesGeneratedUsdPrice += income;

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
