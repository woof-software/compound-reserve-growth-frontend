import { z } from 'zod';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { SortDirectionType } from '@/shared/types/types';

import { $api, type ApiResponse } from '../api/api';

const runwayItemSchema = z.object({
  type: z.string(),
  name: z.string(),
  iconKey: z.string(),
  discipline: z.string(),
  token: z.string(),
  amount: z.number(),
  value: z.number(),
  paymentType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  proposalLink: z.string()
});

const runwayResponseSchema = z.array(runwayItemSchema);

export type RunwayItem = z.infer<typeof runwayItemSchema>;
export type RunwayResponse = z.infer<typeof runwayResponseSchema>;

export type RunwayParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
  type?: string;
  discipline?: string;
};

type UseRunwayOptions = {
  params?: RunwayParams;
  options?: Omit<
    UseQueryOptions<ApiResponse<RunwayResponse>>,
    'queryKey' | 'queryFn'
  >;
};

const RUNWAY_URL = '/api/runway';

export const useRunway = ({ params, options }: UseRunwayOptions = {}) => {
  return useQuery({
    queryKey: ['runway', params],
    queryFn: () =>
      $api.get<RunwayResponse>(RUNWAY_URL, runwayResponseSchema, params),
    ...options
  });
};
