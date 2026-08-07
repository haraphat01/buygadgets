import { z } from "zod";

export const brandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { error: "Name is required." }),
  slug: z.string().min(1, { error: "Slug is required." }),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
});

export type BrandValues = z.infer<typeof brandSchema>;
