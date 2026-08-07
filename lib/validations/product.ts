import { z } from "zod";

export const PRODUCT_CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;

export const variantAttributeSchema = z.object({
  key: z.string().min(1, { error: "Required" }),
  value: z.string().min(1, { error: "Required" }),
});

export const variantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { error: "Variant name is required." }),
  sku: z.string().min(1, { error: "Variant SKU is required." }),
  price: z.coerce.number().nonnegative().nullable().optional(),
  quantity: z.coerce.number().int().nonnegative().default(0),
  attributes: z.array(variantAttributeSchema).default([]),
});

export const productSchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  slug: z.string().min(1, { error: "Slug is required." }),
  brandId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().min(1, { error: "SKU is required." }),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative({ error: "Price must be 0 or more." }),
  discountPrice: z.coerce.number().nonnegative().nullable().optional(),
  flashSaleEndsAt: z.string().optional(),
  quantity: z.coerce.number().int().nonnegative().default(0),
  condition: z.enum(PRODUCT_CONDITIONS),
  warranty: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  processor: z.string().optional(),
  battery: z.string().optional(),
  camera: z.string().optional(),
  display: z.string().optional(),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  published: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
});

export type ProductValues = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
export type VariantValues = z.infer<typeof variantSchema>;
