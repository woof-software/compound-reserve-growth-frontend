import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

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

const finalSourceSchema =
  sourcesAndAssetsApiResponseSchema.shape.sources.element
    .extend({
      asset: assetDetailsSchema
    })
    .omit({ assetId: true });

export const CompoundCumulativeRevenueItemSchema = z.object({
  id: z.number(),
  value: z.number(),
  date: z.number(),
  source: finalSourceSchema
});

export type CompoundCumulativeRevenueItem = z.infer<
  typeof CompoundCumulativeRevenueItemSchema
>;

export type CompoundCumulativeRevenueParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
};

type UseCompCumulativeRevenueOptions = {
  params?: CompoundCumulativeRevenueParams;
  options?: Omit<
    UseQueryOptions<CompoundCumulativeRevenueItem[]>,
    'queryKey' | 'queryFn'
  >;
};

const COMPOUND_REVENUE_HISTORY_URL = '/api/history/v2/revenue';
const SOURCES_URL = '/api/sources';

export const useCompCumulativeRevenue = ({
  params,
  options
}: UseCompCumulativeRevenueOptions = {}) => {
  return useQuery({
    queryKey: ['compoundCumulativeRevenue', params],
    queryFn: async () => {
      const [revenueResponse, sourcesAndAssetsResponse] = await Promise.all([
        $api.get(
          COMPOUND_REVENUE_HISTORY_URL,
          revenueHistoryApiResponseSchema,
          params
        ),
        $api.get(SOURCES_URL, sourcesAndAssetsApiResponseSchema)
      ]);

      if (!revenueResponse?.data || !sourcesAndAssetsResponse?.data) {
        throw new Error('Failed to fetch revenue history or sources');
      }

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

      const mergedData = revenueResponse.data.data.reduce<any[]>(
        (acc, revenueItem) => {
          const sourceWithAsset = sourcesMap.get(revenueItem.sId);

          if (sourceWithAsset) {
            acc.push({
              ...revenueItem,
              source: sourceWithAsset
            });
          } else {
            console.warn(
              `Source with id ${revenueItem.sId} not found for revenue item ${revenueItem.id}`
            );
          }

          return acc;
        },
        []
      );

      const finalTransformedData = mergedData.map((item) => ({
        id: item.id,
        value: item.v,
        date: item.d,
        source: {
          id: item.source.id,
          address: item.source.address,
          network: item.source.network,
          type: item.source.type,
          market: item.source.market,
          asset: item.source.asset
        }
      }));

      return CompoundCumulativeRevenueItemSchema.array().parse(
        finalTransformedData
      );
    },
    ...options
  });
};
