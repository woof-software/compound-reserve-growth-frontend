import { z } from 'zod';

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

export { runwayItemSchema, runwayResponseSchema };
