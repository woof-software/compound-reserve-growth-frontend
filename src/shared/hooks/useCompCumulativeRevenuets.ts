import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { AssetType, SortDirectionType } from '@/shared/types/types';

import { $api, type ApiResponse } from '../api/api';

const assetSchema = z.object({
  id: z.number(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  network: z.string(),
  type: z.nativeEnum(AssetType)
});

const sourceSchema = z.object({
  id: z.number(),
  address: z.string(),
  network: z.string(),
  type: z.string(),
  market: z.string().nullable(),
  asset: assetSchema
});

const compoundCumulativeRevenueItemSchema = z.object({
  id: z.number(),
  value: z.number(),
  date: z.number(),
  source: sourceSchema
});

const metaSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number()
});

const compoundCumulativeRevenueResponseSchema = z.object({
  data: z.array(compoundCumulativeRevenueItemSchema),
  meta: metaSchema.optional()
});

export type CompoundCumulativeRevenueItem = z.infer<
  typeof compoundCumulativeRevenueItemSchema
>;
export type CompoundCumulativeRevenueResponse = z.infer<
  typeof compoundCumulativeRevenueResponseSchema
>;

export type CompoundCumulativeRevenueParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
};

type UseCompCumulativeRevenueOptions = {
  params?: CompoundCumulativeRevenueParams;
  options?: Omit<
    UseQueryOptions<ApiResponse<CompoundCumulativeRevenueResponse>>,
    'queryKey' | 'queryFn'
  >;
};

const COMPOUND_REVENUE_HISTORY_URL = '/api/history/revenue';

export const useCompCumulativeRevenue = ({
  params,
  options
}: UseCompCumulativeRevenueOptions = {}) => {
  return useQuery({
    queryKey: ['compoundCumulativeRevenue', params],
    queryFn: () =>
      $api.get<CompoundCumulativeRevenueResponse>(
        COMPOUND_REVENUE_HISTORY_URL,
        compoundCumulativeRevenueResponseSchema,
        params
      ),
    ...options
  });
};
