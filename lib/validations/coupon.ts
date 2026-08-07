import { z } from "zod";

export const COUPON_TYPES = ["PERCENTAGE", "FIXED"] as const;

// Blank inputs arrive as "" — treat those as "not set" rather than
// coercing to 0 (which would wrongly satisfy .positive()/.nonnegative()
// or get stored as a real 0 instead of "no limit"/"no minimum").
function blankToUndefined(val: unknown) {
  return val === "" || val === null ? undefined : val;
}

export const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .min(1, { error: "Code is required." })
    .transform((v) => v.trim().toUpperCase()),
  type: z.enum(COUPON_TYPES),
  value: z.coerce.number().positive({ error: "Value must be greater than 0." }),
  expiryDate: z.string().optional(),
  usageLimit: z.preprocess(blankToUndefined, z.coerce.number().int().positive().optional()),
  minimumSpend: z.preprocess(blankToUndefined, z.coerce.number().nonnegative().optional()),
  active: z.boolean().default(true),
});

export type CouponFormInput = z.input<typeof couponSchema>;
export type CouponValues = z.infer<typeof couponSchema>;
