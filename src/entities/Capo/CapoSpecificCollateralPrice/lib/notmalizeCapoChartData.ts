import { createSourcesMap } from '@/shared/lib/utils/createSourcesMap';
import { CapoItem } from '@/shared/types/Capo/types';
import { Asset, Source } from '@/shared/types/types';

export type NormalizeCapoChartRecord = {
  assetId: number;
  network: string;
  collateral: string;
  price: string;
  capValue: string;
  dateOfAggregation: number;
};

export const normalizeCapoChartData = (
  capoData: CapoItem[],
  sourcesData: { sources: Source[]; assets: Asset[] }
): NormalizeCapoChartRecord[] => {
  if (!capoData || !sourcesData) {
    return [];
  }

  const { assetsMap } = createSourcesMap(sourcesData);

  const processedData: NormalizeCapoChartRecord[] = [];

  for (const capoItem of capoData) {
    const asset = assetsMap.get(capoItem.assetId);

    if (!asset) {
      console.warn(`CAPO: Asset with ID ${capoItem.assetId} not found`);

      continue;
    }

    processedData.push({
      assetId: capoItem.assetId,
      network: asset.network,
      collateral: asset.symbol,
      price: capoItem.price,
      capValue: capoItem.capValue,
      dateOfAggregation: capoItem.dateOfAggregation
    });
  }

  return processedData;
};
