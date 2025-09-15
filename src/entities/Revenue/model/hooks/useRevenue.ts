import { useQuery } from '@tanstack/react-query';

import {
  COMPOUND_REVENUE_HISTORY_URL,
  revenueHistoryApiResponseSchema,
  RevenueItem,
  SOURCES_URL,
  sourcesAndAssetsApiResponseSchema,
  UseCompCumulativeRevenueOptions
} from '@/entities/Revenue';
import { $api } from '@/shared/api/api';

export const useRevenue = ({
  params,
  options
}: UseCompCumulativeRevenueOptions = {}) => {
  return useQuery({
    queryKey: ['compoundCumulativeRevenue', params],
    queryFn: async (): Promise<RevenueItem[]> => {
      const [revenueResponse, sourcesAndAssetsResponse] = await Promise.all([
        $api.get(
          COMPOUND_REVENUE_HISTORY_URL,
          revenueHistoryApiResponseSchema,
          params
        ),
        $api.get(SOURCES_URL, sourcesAndAssetsApiResponseSchema)
      ]);

      const assetsMap = new Map(
        sourcesAndAssetsResponse.data.assets.map((asset) => [asset.id, asset])
      );

      const sourcesMap = new Map(
        sourcesAndAssetsResponse.data.sources.map((source) => {
          const assetDetails = assetsMap.get(source.assetId) || {
            id: -1,
            type: 'Unknown',
            symbol: 'N/A',
            address: '0x0',
            decimals: 0,
            network: 'N/A'
          };
          return [source.id, { ...source, asset: assetDetails }];
        })
      );

      const finalData: RevenueItem[] = [];
      for (const revenueItem of revenueResponse.data.data) {
        const sourceWithAsset = sourcesMap.get(revenueItem.sId);
        if (sourceWithAsset) {
          finalData.push({
            id: revenueItem.id,
            value: revenueItem.v,
            date: revenueItem.d,
            source: sourceWithAsset
          });
        }
      }

      return finalData;
    },
    ...options
  });
};
