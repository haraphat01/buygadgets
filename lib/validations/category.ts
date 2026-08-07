import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { error: "Name is required." }),
  slug: z.string().min(1, { error: "Slug is required." }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
