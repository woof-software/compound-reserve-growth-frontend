import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

import { SOURCES_URL, TREASURY_HISTORY_URL } from '../consts';
import {
  historyApiResponseSchema,
  sourcesAndAssetsApiResponseSchema
} from '../schema';
import { TreasuryHistoryItem, UseTreasuryHistoryOptions } from '../types';

export const useTreasuryHistory = ({
  params,
  options
}: UseTreasuryHistoryOptions = {}) => {
  return useQuery({
    queryKey: ['treasuryHistory', params],
    queryFn: async (): Promise<TreasuryHistoryItem[]> => {
      const [historyResponse, sourcesAndAssetsResponse] = await Promise.all([
        $api.get(TREASURY_HISTORY_URL, historyApiResponseSchema, params),
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

      const finalData: TreasuryHistoryItem[] = [];
      for (const historyItem of historyResponse.data.data) {
        const sourceWithAsset = sourcesMap.get(historyItem.sId);
        if (sourceWithAsset) {
          finalData.push({
            id: historyItem.id,
            sId: historyItem.sId,
            quantity: historyItem.q,
            price: historyItem.p,
            value: historyItem.v,
            date: historyItem.d,
            source: sourceWithAsset
          });
        }
      }

      return finalData;
    },
    ...options
  });
};
