import { capitalizeFirstLetter, colorPicker } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

type TabType = 'lend' | 'borrow' | 'total';

export const getChartData = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  const getTabValue = (item: CombinedIncentivesData): number => {
    const { rewardsSupply = 0, rewardsBorrow = 0 } = item || {};

    const values = {
      lend: rewardsSupply,
      borrow: rewardsBorrow,
      total: rewardsSupply + rewardsBorrow
    };

    const normalizedTab = activeTab?.toLowerCase() as TabType;
    return values[normalizedTab];
  };

  const groupedByNetwork: Record<string, number> = data.reduce(
    (acc: Record<string, number>, item: CombinedIncentivesData) => {
      const network = item.source.network;
      const value = getTabValue(item);

      acc[network] = (acc[network] || 0) + value;

      return acc;
    },
    {}
  );

  return Object.entries(groupedByNetwork)
    .map(([network, value], index) => ({
      name: capitalizeFirstLetter(network),
      value: value,
      color: colorPicker(index)
    }))
    .filter((el: any) => el.value > 0);
};
