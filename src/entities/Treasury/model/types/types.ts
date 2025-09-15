import { z } from 'zod';
import type { UseQueryOptions } from '@tanstack/react-query';

import { SortDirectionType } from '@/shared/types/types';

import { assetDetailsSchema } from '../schema';

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

export type UseTreasuryHistoryOptions = {
  params?: TreasuryHistoryParams;
  options?: Omit<
    UseQueryOptions<TreasuryHistoryItem[]>,
    'queryKey' | 'queryFn'
  >;
};
