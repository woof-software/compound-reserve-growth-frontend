import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

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

/**
 * get sources data from API https://compound-reserve-growth-backend-dev.woof.software/api/docs#/Capo/CapoController_list
 */
export const useCapoApiData = () => {
  return useQuery({
    queryKey: ['capo-page-api-data'],
    queryFn: () => $api.get(CAPO_API_URL, capoApiResponseSchema),
    select: (data) => {
      return data?.data?.data?.map((item) => ({
        oracleAddress: item?.oa,
        oracleName: item?.on,
        dateOfAggregation: item?.d,
        capValue: item?.cp,
        assetId: item?.aId,
        price: item?.lp
      }));
    }
  });
};
