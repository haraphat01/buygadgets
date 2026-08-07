import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required." }),
  lastName: z.string().min(1, { error: "Last name is required." }),
  email: z.email({ error: "Enter a valid email address." }),
  phone: z.string().optional(),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const customerLoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});
export type CustomerLoginValues = z.infer<typeof customerLoginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
});
export type RequestPasswordResetValues = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: "Current password is required." }),
  newPassword: z.string().min(8, { error: "Password must be at least 8 characters." }),
});
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required." }),
  lastName: z.string().min(1, { error: "Last name is required." }),
  phone: z.string().optional(),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().optional(),
  firstName: z.string().min(1, { error: "First name is required." }),
  lastName: z.string().min(1, { error: "Last name is required." }),
  phone: z.string().min(1, { error: "Phone number is required." }),
  state: z.string().min(1, { error: "State is required." }),
  city: z.string().min(1, { error: "City is required." }),
  address: z.string().min(1, { error: "Address is required." }),
  isDefault: z.boolean().default(false),
});
export type AddressFormInput = z.input<typeof addressSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
