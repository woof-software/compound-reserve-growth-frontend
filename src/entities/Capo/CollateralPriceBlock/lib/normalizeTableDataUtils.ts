import { createSourcesMap } from '@/shared/lib/utils/createSourcesMap';
import { CapoItem, CapoTableItem } from '@/shared/types/Capo/types';
import { Asset, Source } from '@/shared/types/types';

export const normalizeCapoData = (
  capoData: CapoItem[],
  sourcesData: { sources: Source[]; assets: Asset[] }
): CapoTableItem[] => {
  if (!capoData || !sourcesData) {
    return [];
  }

  const { assetsMap } = createSourcesMap(sourcesData);

  const existingAssets = new Set<number>();

  const result = new Array<CapoTableItem>();

  for (const capoItem of capoData) {
    if (existingAssets.has(capoItem.assetId)) continue;

    const asset = assetsMap.get(capoItem.assetId);

    if (!asset) {
      console.warn(`CAPO: Asset with ID ${capoItem.assetId} not found`);

      continue;
    }

    result.push({
      network: asset.network,
      collateral: asset.symbol,
      collateralPrice: capoItem?.price,
      priceRestriction: capoItem?.capValue,
      priceFeed: capoItem?.oracleAddress,
      priceBuffer: Number(capoItem?.capValue) - Number(capoItem?.price),
      oracleName: capoItem?.oracleName
    });

    existingAssets.add(capoItem.assetId);
  }

  return result;
};
