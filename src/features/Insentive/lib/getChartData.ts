import { capitalizeFirstLetter, colorPicker } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';

type TabType = 'lend' | 'borrow' | 'total';

export const getChartData = (
  data: CombinedIncentivesData[],
  activeTab: string
) => {
  const getTabValue = (item: CombinedIncentivesData): number => {
    const { valueSupply = 0, valueBorrow = 0 } = item?.spends || {};

    const values = {
      lend: valueSupply,
      borrow: valueBorrow,
      total: valueSupply + valueBorrow
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
