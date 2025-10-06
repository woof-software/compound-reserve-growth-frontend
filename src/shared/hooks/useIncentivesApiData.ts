import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

const STATS_API_URL = '/api/history/v2/stats';

const incentivesApiResponseSchema = z.object({
  data: z.array(
    z.object({
      incomes: z.object({
        id: z.number(),
        vb: z.number(),
        vs: z.number()
      }),
      spends: z
        .object({
          id: z.number(),
          vb: z.number(),
          vs: z.number()
        })
        .optional(),
      pc: z.number(),
      d: z.number(),
      sourceId: z.number()
    })
  ),
  meta: z.object({
    limit: z.number().nullable(),
    offset: z.number(),
    total: z.number()
  })
});

type IncentiveApiResponse = z.infer<typeof incentivesApiResponseSchema>;
type IncentiveApiItem = IncentiveApiResponse['data'][number];
type IncentiveItem = {
  incomes: {
    id: number;
    valueBorrow: number;
    valueSupply: number;
  };
  spends?: {
    id: number;
    valueBorrow: number;
    valueSupply: number;
  };
  date: number;
  compoundPrice: number;
  sourceId: number;
};

/**
 * get sources data from API https://compound-reserve-growth-backend-dev.woof.software/api/docs#/History/HistoryController_getStatsHistory
 */
export const useIncentivesApiData = () => {
  return useQuery({
    queryKey: ['incentives-page-api-data'],
    queryFn: async () => {
      const response = await $api.get(
        STATS_API_URL,
        incentivesApiResponseSchema
      );
      return response.data.data.map<IncentiveItem>(
        (item: IncentiveApiItem) => ({
          incomes: {
            id: item.incomes.id,
            valueBorrow: item.incomes.vb,
            valueSupply: item.incomes.vs
          },
          ...(item?.spends
            ? {
                spends: {
                  id: item.spends?.id,
                  valueBorrow: item.spends?.vb,
                  valueSupply: item.spends?.vs
                }
              }
            : {}),
          date: item.d,
          compoundPrice: item.pc,
          sourceId: item.sourceId
        })
      );
    }
  });
};
