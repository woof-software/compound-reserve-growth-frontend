import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { $api, ApiResponse } from '@/shared/api';

import { RUNWAY_URL } from '../consts';
import { runwayResponseSchema } from '../schema';
import { RunwayParams, RunwayResponse } from '../types';

type UseRunwayOptions = {
  params?: RunwayParams;

  options?: Omit<
    UseQueryOptions<ApiResponse<RunwayResponse>>,
    'queryKey' | 'queryFn'
  >;
};

export const useRunway = ({ params, options }: UseRunwayOptions = {}) => {
  return useQuery({
    queryKey: ['runway', params],
    queryFn: () =>
      $api.get<RunwayResponse>(RUNWAY_URL, runwayResponseSchema, params),
    ...options
  });
};
