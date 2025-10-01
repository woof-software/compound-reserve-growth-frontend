import { createSourcesMap } from '@/shared/lib/utils/createSourcesMap';
import { CapoItem } from '@/shared/types/Capo/types';
import { Asset, Source } from '@/shared/types/types';

export const normalizeCapoChartData = (
  capoData: CapoItem[],
  sourcesData: { sources: Source[]; assets: Asset[] }
) => {
  if (!capoData || !sourcesData) {
    return [];
  }

  const { sourcesMap, assetsMap } = createSourcesMap(sourcesData);

  return capoData.map((capoItem) => {
    const source = sourcesMap.get(capoItem.assetId);
    const asset = assetsMap.get(capoItem.assetId);

    return {
      assetId: capoItem?.assetId,
      network: source?.network || '',
      collateral: asset?.symbol || '',
      price: capoItem?.price,
      capValue: capoItem?.capValue,
      dateOfAggregation: capoItem?.dateOfAggregation
    };
  });
};
