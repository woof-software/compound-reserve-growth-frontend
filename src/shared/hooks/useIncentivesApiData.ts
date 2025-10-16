import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

const STATS_API_URL = '/api/history/v2/incentives';

const incentivesApiResponseSchema = z.object({
  data: z.array(
    z.object({
      i: z.number(),
      rs: z.number(),
      rb: z.number(),
      pc: z.number(),
      sid: z.number(),
      d: z.number()
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
  income: number;
  rewardsSupply: number;
  rewardsBorrow: number;
  compoundPrice: number;
  sourceId: number;
  date: number;
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
          income: item.i,
          rewardsSupply: item.rs,
          rewardsBorrow: item.rb,
          compoundPrice: item.pc,
          sourceId: item.sid,
          date: item.d
        })
      );
    }
  });
};
