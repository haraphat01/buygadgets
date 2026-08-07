import { z } from "zod";

export const flashSaleSchema = z.object({
  productId: z.string().uuid({ error: "Pick a product." }),
  discountPrice: z.coerce.number().positive({ error: "Sale price must be greater than 0." }),
  flashSaleEndsAt: z.string().min(1, { error: "End date/time is required." }),
});

export type FlashSaleValues = z.infer<typeof flashSaleSchema>;
export type FlashSaleFormInput = z.input<typeof flashSaleSchema>;
