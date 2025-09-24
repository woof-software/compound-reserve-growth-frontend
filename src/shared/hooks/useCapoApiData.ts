import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

const CAPO_API_URL = '/api/capo';

const capoApiResponseSchema = z.object({
  data: z.array(
    z.object({
      oa: z.string(),
      on: z.string(),
      cId: z.number(),
      d: z.number(),
      ar: z.string(),
      mr: z.string(),
      xr: z.string(),
      cp: z.string(),
      ap: z.string(),
      mp: z.string(),
      xp: z.string(),
      cc: z.number(),
      tc: z.number(),
      sId: z.number(),
      aId: z.number()
    })
  )
});

export const useCapoApiData = () => {
  return useQuery({
    queryKey: ['capo-page-api-data'],
    queryFn: () => $api.get(CAPO_API_URL, capoApiResponseSchema),
    select: (data) => {
      return data?.data?.data?.map((item) => ({
        oracleAddress: item?.oa,
        oracleName: item?.on,
        chainId: item?.cId,
        dateOfAggregation: item?.d,
        averageRatio: item?.ar,
        minimumRatio: item?.mr,
        maximumRatio: item?.xr,
        capValue: item?.cp,
        averagePrice: item?.ap,
        minimumPrice: item?.mp,
        maximumPrice: item?.xp,
        countOfCappedEntries: item?.cc,
        totalCountOfEntries: item?.tc,
        sourceId: item?.sId,
        assetId: item?.aId
      }));
    }
  });
};
