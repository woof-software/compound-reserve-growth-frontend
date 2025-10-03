import { Source } from '@/shared/types/types';

interface TableData {
  network: string;
  valueComp: number;
  valueUsd: number;
  source: Source;
}

export const getCsvData = (filteredData: TableData[]) => {
  return filteredData.map((item) => ({
    network: item.network,
    valueComp: item.valueComp,
    valueUsd: item.valueUsd,
    source: item.source.market
  }));
};
