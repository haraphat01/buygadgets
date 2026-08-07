import { z } from "zod";

export const CHECKOUT_PAYMENT_METHODS = ["PAYSTACK", "CREDIT_DIRECT", "KLUMP"] as const;

export const checkoutSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required." }),
  lastName: z.string().min(1, { error: "Last name is required." }),
  phone: z.string().min(1, { error: "Phone number is required." }),
  email: z.email({ error: "Enter a valid email address." }),
  state: z.string().min(1, { error: "State is required." }),
  city: z.string().min(1, { error: "City is required." }),
  address: z.string().min(1, { error: "Address is required." }),
  orderNotes: z.string().optional(),
  deliveryMethodId: z.string().uuid({ error: "Select a delivery method." }),
  paymentMethod: z.enum(CHECKOUT_PAYMENT_METHODS),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
