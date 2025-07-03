import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { AssetType, SortDirectionType, SourceType } from '@/shared/types/types';

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
  market: z.string(),
  asset: assetSchema,
  type: z.nativeEnum(SourceType)
});

const treasuryHistoryItemSchema = z.object({
  id: z.number(),
  quantity: z.string(),
  price: z.number(),
  value: z.number(),
  date: z.number(),
  source: sourceSchema
});

const metaSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number()
});

const treasuryHistoryResponseSchema = z.object({
  data: z.array(treasuryHistoryItemSchema),
  meta: metaSchema
});

export type TreasuryHistoryItem = z.infer<typeof treasuryHistoryItemSchema>;
export type TreasuryHistoryResponse = z.infer<
  typeof treasuryHistoryResponseSchema
>;

export type TreasuryHistoryParams = {
  page?: number;

  perPage?: number;

  order?: SortDirectionType;
};

type UseTreasuryHistoryOptions = {
  params?: TreasuryHistoryParams;
  options?: Omit<
    UseQueryOptions<ApiResponse<TreasuryHistoryResponse>>,
    'queryKey' | 'queryFn'
  >;
};

const TREASURY_HISTORY_URL = '/api/history/treasury';

export const useTreasuryHistory = ({
  params,
  options
}: UseTreasuryHistoryOptions = {}) => {
  return useQuery({
    queryKey: ['treasuryHistory', params],
    queryFn: () =>
      $api.get<TreasuryHistoryResponse>(
        TREASURY_HISTORY_URL,
        treasuryHistoryResponseSchema,
        params
      ),
    ...options
  });
};
