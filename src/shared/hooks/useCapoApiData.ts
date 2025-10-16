import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';
import { CapoItem } from '@/shared/types/Capo/types';

const CAPO_API_URL = '/api/capo';

const capoApiResponseSchema = z.object({
  data: z.array(
    z.object({
      oa: z.string(),
      on: z.string(),
      d: z.number(),
      cp: z.string(),
      lp: z.string(),
      aId: z.number()
    })
  )
});

type CapoApiResponse = z.infer<typeof capoApiResponseSchema>;
type CapoApiItem = CapoApiResponse['data'][number];

const transformCapoItem = (item: CapoApiItem): CapoItem => ({
  oracleAddress: item.oa,
  oracleName: item.on,
  dateOfAggregation: item.d,
  capValue: item.cp,
  assetId: item.aId,
  price: item.lp
});

/**
 * get sources data from API https://compound-reserve-growth-backend-dev.woof.software/api/docs#/Capo/CapoController_list
 */
export const useCapoApiData = () => {
  return useQuery({
    queryKey: ['capo-page-api-data'],
    queryFn: async () => {
      const response = await $api.get(CAPO_API_URL, capoApiResponseSchema);
      return response.data.data.map(transformCapoItem);
    }
  });
};
