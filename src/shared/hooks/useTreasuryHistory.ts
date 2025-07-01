import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { $api, ApiResponse } from '../api/api';

const assetSchema = z.object({
  id: z.number(),
  address: z.string().nullable(),
  decimals: z.number(),
  symbol: z.string().nullable(),
  network: z.string().nullable(),
  type: z.string().nullable()
});

const sourceSchema = z.object({
  id: z.number(),
  address: z.string().nullable(),
  network: z.string().nullable(),
  market: z.string().nullable(),
  asset: assetSchema
});

const treasuryHistoryItemSchema = z.object({
  id: z.number(),
  quantity: z.string().nullable(),
  price: z.number().nullable(),
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

export type TreasuryHistoryResponse = z.infer<
  typeof treasuryHistoryResponseSchema
>;
export type TreasuryHistoryItem = z.infer<typeof treasuryHistoryItemSchema>;

export type TreasuryHistoryParams = {
  page?: number;
  perPage?: number;
};

type UseTreasuryHistoryOptions = {
  params?: TreasuryHistoryParams;
  options?: Omit<
    UseQueryOptions<ApiResponse<TreasuryHistoryResponse>>,
    'queryKey' | 'queryFn'
  >;
};

const TREASURY_HISTORY_URL = '/api/history/treasury';

export const useTreasuryHistory = (hookOptions?: UseTreasuryHistoryOptions) => {
  const { params, options } = hookOptions ?? {};

  return useQuery({
    queryKey: ['treasuryHistory', params],
    queryFn: () =>
      $api.get<TreasuryHistoryResponse>(
        TREASURY_HISTORY_URL,
        treasuryHistoryResponseSchema,
        params,
        undefined
      ),
    ...options
  });
};
