import { Asset, Source } from '@/shared/types/types';

export const createSourcesMap = (
  sourcesData:
    | {
        sources: Source[];
        assets: Asset[];
      }
    | undefined
) => {
  const sourcesMap = new Map<number, Source>();
  const assetsMap = new Map<number, Asset>();

  if (!sourcesData) {
    return { sourcesMap, assetsMap };
  }

  sourcesData.sources.forEach((source) => {
    sourcesMap.set(source.id, source);
  });

  sourcesData.assets.forEach((asset) => {
    assetsMap.set(asset.id, asset);
  });

  return { sourcesMap, assetsMap };
};
