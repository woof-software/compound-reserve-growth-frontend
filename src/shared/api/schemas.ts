import { z } from 'zod';

export const createApiResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: dataSchema,
    statusCode: z.number()
  });

export const baseApiResponseSchema = z.object({
  data: z.unknown(),
  statusCode: z.number()
});
