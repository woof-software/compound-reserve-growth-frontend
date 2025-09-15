import { z } from 'zod';

export const historyApiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      q: z.string(),
      p: z.number(),
      v: z.number(),
      d: z.number(),
      sId: z.number()
    })
  )
});

export const assetDetailsSchema = z.object({
  id: z.number(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  network: z.string(),
  type: z.string()
});

export const sourcesAndAssetsApiResponseSchema = z.object({
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
