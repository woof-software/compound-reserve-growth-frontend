import { z } from 'zod';

import { SortDirectionType } from '@/shared/types';

import { runwayItemSchema, runwayResponseSchema } from '../schema';

type RunwayItem = z.infer<typeof runwayItemSchema>;
type RunwayResponse = z.infer<typeof runwayResponseSchema>;

type RunwayParams = {
  page?: number;
  perPage?: number;
  order?: SortDirectionType;
  type?: string;
  discipline?: string;
};

export type { RunwayItem, RunwayParams, RunwayResponse };
