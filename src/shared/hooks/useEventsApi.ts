import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { $api } from '@/shared/api/api';

const EVENTS_API_URL = '/api/events';

const EventSchema = z.object({
  id: z.number(),
  name: z.string(),
  date: z.number()
});

const ResponseSchema = z.array(EventSchema);

export type EventsApiResponse = z.infer<typeof ResponseSchema>;
export type CompoundEvent = z.infer<typeof EventSchema>;

/**
 * Get compound events collection from API
 *
 * https://compound-reserve-growth-backend-dev.woof.software/api/docs#/Event/EventController_getEventList
 */
export const useEventsApi = () => {
  return useQuery({
    queryKey: ['compound-events-api-data'],
    queryFn: async () => {
      const { data } = await $api.get(EVENTS_API_URL, ResponseSchema);

      return data;
    }
  });
};
