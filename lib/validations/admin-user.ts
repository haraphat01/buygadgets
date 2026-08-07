import { z } from "zod";

export const ASSIGNABLE_ROLES = ["ADMIN", "STAFF"] as const;

export const createAdminUserSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
  fullName: z.string().min(1, { error: "Name is required." }),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type CreateAdminUserValues = z.infer<typeof createAdminUserSchema>;
