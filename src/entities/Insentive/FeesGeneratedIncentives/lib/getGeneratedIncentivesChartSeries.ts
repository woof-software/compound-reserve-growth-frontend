import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

type ChartPoint = {
  x: number;
  y: number;
};

type ChartSeriesObject = {
  name: string;
  data: ChartPoint[];
};

export const getGeneratedIncentivesChartSeries = (
  filteredData: CombinedIncentivesData[]
): ChartSeriesObject[] => {
  const groupedDataByNetworkAndDate = filteredData.reduce((acc, item) => {
    const network = item.source.network;
    const date = item.date;

    if (!acc.has(network)) {
      acc.set(network, new Map());
    }
    const networkGroup = acc.get(network)!;

    if (!networkGroup.has(date)) {
      networkGroup.set(date, {
        ...item,
        rewardsSupply: 0,
        rewardsBorrow: 0,
        income: 0
      });
    }

    const dateEntry = networkGroup.get(date)!;

    dateEntry.rewardsBorrow += item.rewardsBorrow;
    dateEntry.rewardsSupply += item.rewardsSupply;
    if (item.income > 0) {
      dateEntry.income += item.income;
    }

    return acc;
  }, new Map<string, Map<number, CombinedIncentivesData>>());

  const aggregatedByDate = new Map<
    number,
    { incentives: number; fees: number }
  >();

  groupedDataByNetworkAndDate.forEach((networkGroup) => {
    networkGroup.forEach((entry, date) => {
      if (!aggregatedByDate.has(date)) {
        aggregatedByDate.set(date, { incentives: 0, fees: 0 });
      }

      const aggregate = aggregatedByDate.get(date)!;

      aggregate.incentives += entry.rewardsSupply + entry.rewardsBorrow;
      aggregate.fees += entry.income;
    });
  });

  const incentivesData: ChartPoint[] = [];
  const feesData: ChartPoint[] = [];

  Array.from(aggregatedByDate.entries())
    .sort(([dateA], [dateB]) => dateA - dateB)
    .forEach(([date, values]) => {
      incentivesData.push({ x: date * 1000, y: values.incentives });
      feesData.push({ x: date * 1000, y: values.fees });
    });

  return [
    {
      name: 'Incentives',
      data: incentivesData
    },
    {
      name: 'Revenue',
      data: feesData
    }
  ];
};
