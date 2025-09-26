import { TableItem } from '@/shared/types/Capo/types';

type Source = {
  id: number;
  address: string;
  network: string;
  type: string;
  market: string | null;
  assetId: number;
};

type Asset = {
  id: number;
  address: string;
  decimals: number;
  symbol: string;
  network: string;
  type: string;
};

type CapoItem = {
  oracleAddress: string;
  oracleName: string;
  chainId: number;
  dateOfAggregation: number;
  averageRatio: string;
  minimumRatio: string;
  maximumRatio: string;
  capValue: string;
  averagePrice: string;
  minimumPrice: string;
  maximumPrice: string;
  countOfCappedEntries: number;
  totalCountOfEntries: number;
  assetId: number;
};

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
      collateralPrice: capoItem?.averagePrice,
      priceRestriction: capoItem?.capValue,
      priceFeed: capoItem?.oracleAddress,
      oracleName: capoItem?.oracleName
    };
  });
};
