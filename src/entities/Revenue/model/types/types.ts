import { z } from 'zod';
import type { UseQueryOptions } from '@tanstack/react-query';

import { assetDetailsSchema } from '@/entities/Revenue';
import { SortDirectionType } from '@/shared/types';

type RevenueItem = {
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

type CompoundCumulativeRevenueParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
};

type UseCompCumulativeRevenueOptions = {
  params?: CompoundCumulativeRevenueParams;
  options?: Omit<UseQueryOptions<RevenueItem[]>, 'queryKey' | 'queryFn'>;
};

export type {
  CompoundCumulativeRevenueParams,
  RevenueItem,
  UseCompCumulativeRevenueOptions
};
