import { Asset, CapoItem, Source } from '@/shared/types/Capo/types';

export const createSourcesMap = (sourcesData: {
  sources: Source[];
  assets: Asset[];
}) => {
  const sourcesMap = new Map<number, Source>();
  const assetsMap = new Map<number, Asset>();

  sourcesData.sources.forEach((source) => {
    sourcesMap.set(source.id, source);
  });

  sourcesData.assets.forEach((asset) => {
    assetsMap.set(asset.id, asset);
  });

  return { sourcesMap, assetsMap };
};

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
