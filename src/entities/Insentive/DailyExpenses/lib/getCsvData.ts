import { Source } from '@/shared/types/types';

interface NormalizedTableData {
  network: string;
  market: string;
  lendIncentive: number;
  borrowIncentive: number;
  total: number;
  source: Source;
}

export const getCsvData = (filteredData: NormalizedTableData[]) => {
  return filteredData.map((item) => ({
    network: item.network,
    market: item.market,
    lendIncentive: item.lendIncentive,
    borrowIncentive: item.borrowIncentive,
    total: item.total,
    source: item.source.address
  }));
};
