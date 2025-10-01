import { createSourcesMap } from '@/shared/lib/utils/createSourcesMap';
import { CapoItem, TableItem } from '@/shared/types/Capo/types';
import { Asset, Source } from '@/shared/types/types';

export const normalizeCapoData = (
  capoData: CapoItem[],
  sourcesData: { sources: Source[]; assets: Asset[] }
): TableItem[] => {
  if (!capoData || !sourcesData) {
    return [];
  }

  const { sourcesMap, assetsMap } = createSourcesMap(sourcesData);

  return capoData.map((capoItem) => {
    const source = sourcesMap.get(capoItem.assetId);
    const asset = assetsMap.get(capoItem.assetId);

    return {
      network: source?.network || '',
      collateral: asset?.symbol || '',
      collateralPrice: capoItem?.price,
      priceRestriction: capoItem?.capValue,
      priceFeed: capoItem?.oracleAddress,
      oracleName: capoItem?.oracleName
    };
  });
};
