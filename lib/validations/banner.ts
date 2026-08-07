import { z } from "zod";

export const BANNER_POSITIONS = ["hero", "promotion"] as const;

export const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, { error: "Title is required." }),
  imageUrl: z.string().min(1, { error: "Image is required." }),
  link: z.string().optional(),
  position: z.enum(BANNER_POSITIONS),
  active: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type BannerValues = z.infer<typeof bannerSchema>;
export type BannerFormInput = z.input<typeof bannerSchema>;
