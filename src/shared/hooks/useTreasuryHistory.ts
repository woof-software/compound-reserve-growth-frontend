import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { $api } from '../api/api';
import { SortDirectionType } from '../types/types';

const historyApiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      q: z.string(),
      p: z.number(),
      v: z.number(),
      d: z.number(),
      sId: z.number()
    })
  )
});

const assetDetailsSchema = z.object({
  id: z.number(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  network: z.string(),
  type: z.string()
});

const sourcesAndAssetsApiResponseSchema = z.object({
  sources: z.array(
    z.object({
      id: z.number(),
      address: z.string(),
      network: z.string(),
      type: z.string(),
      market: z.string().nullable(),
      assetId: z.number()
    })
  ),
  assets: z.array(assetDetailsSchema)
});

export type TreasuryHistoryItem = {
  id: number;
  sId: number;
  quantity: string;
  price: number;
  value: number;
  date: number;
  source: {
    id: number;
    address: string;
    network: string;
    type: string;
    market: string | null;
    assetId: number;
    asset: z.infer<typeof assetDetailsSchema>;
  };
};

export type TreasuryHistoryParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
};

type UseTreasuryHistoryOptions = {
  params?: TreasuryHistoryParams;
  options?: Omit<
    UseQueryOptions<TreasuryHistoryItem[]>,
    'queryKey' | 'queryFn'
  >;
};

const TREASURY_HISTORY_URL = '/api/history/v2/treasury';
const SOURCES_URL = '/api/sources';

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
