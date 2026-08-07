import { z } from "zod";

export const deliveryMethodsSchema = z.object({
  buygadgets: z.object({
    fee: z.coerce.number().nonnegative(),
    estimatedDays: z.string().optional(),
    active: z.boolean().default(true),
  }),
  gig: z.object({
    fee: z.coerce.number().nonnegative(),
    estimatedDays: z.string().optional(),
    active: z.boolean().default(true),
  }),
  pickup: z.object({
    address: z.string().optional(),
    businessHours: z.string().optional(),
    active: z.boolean().default(true),
  }),
});

export type DeliveryMethodsValues = z.infer<typeof deliveryMethodsSchema>;
export type DeliveryMethodsFormInput = z.input<typeof deliveryMethodsSchema>;
