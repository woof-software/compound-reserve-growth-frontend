import { capitalizeFirstLetter, formatPrice } from '@/shared/lib/utils';
import { TokenData } from '@/shared/types';

const mapCompositionBlockChartData = (
  data: Record<string, TokenData[]>,
  uniqData: TokenData[]
) => {
  const totalSum = uniqData.reduce((acc, item) => acc + item.value, 0);
  if (totalSum === 0) {
    return [];
  }

  return Object.entries(data)
    .map(([key, value]) => {
      const totalValue = value.reduce((acc, item) => acc + item.value, 0);
      const percent = (totalValue / totalSum) * 100;

      return {
        name: capitalizeFirstLetter(key) || 'Unclassified',
        percent: parseFloat(percent.toFixed(2)),
        value: formatPrice(totalValue, 1),
        rawValue: totalValue
      };
    })
    .sort((a, b) => b.percent - a.percent);
};

const mapCompositionBlockTableData = (data: Record<string, TokenData[]>) => {
  return Object.entries(data)
    .map(([key, value], index) => {
      const balance = value.reduce((acc, item) => acc + item.value, 0);
      const symbol = value[0]?.source.asset.symbol || key;

      return {
        id: index + 1,
        icon: key.replace(/ /g, '-').toLowerCase(),
        name: capitalizeFirstLetter(key) || 'Unclassified',
        balance,
        symbol
      };
    })
    .sort((a, b) => b.balance - a.balance);
};

export { mapCompositionBlockChartData, mapCompositionBlockTableData };
