import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

const SOURCE_API_URL = '/api/sources';

const assetDetailsSchema = z.object({
  id: z.number(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  network: z.string(),
  type: z.string()
});

const sourcesApiResponseSchema = z.object({
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

export const useSourceApiData = () => {
  return useQuery({
    queryKey: ['source-api-data'],
    queryFn: () => $api.get(SOURCE_API_URL, sourcesApiResponseSchema)
  });
};
