import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { NOT_MARKET } from '@/shared/consts/consts';
import { SortDirectionType } from '@/shared/types/types';

import { $api } from '../api/api';

const revenueHistoryApiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
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

export type RevenueItem = {
  id: number;
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

export type CompoundCumulativeRevenueParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
};

export type RevenuePageProps = {
  revenueData: RevenueItem[];
  isLoading: boolean;
  isError: boolean;
};

type UseCompCumulativeRevenueOptions = {
  params?: CompoundCumulativeRevenueParams;
  options?: Omit<UseQueryOptions<RevenueItem[]>, 'queryKey' | 'queryFn'>;
};

const COMPOUND_REVENUE_HISTORY_URL = '/api/history/v2/revenue';
const SOURCES_URL = '/api/sources';

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
            type: NOT_MARKET,
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
