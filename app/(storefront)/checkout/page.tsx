import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCart } from "@/services/cart";
import { getActiveDeliveryMethods } from "@/services/checkout";
import { getPaymentSettings } from "@/services/settings";
import { getOptionalCustomerSession } from "@/lib/customer-auth";
import { getCustomerAddresses } from "@/services/customer-account";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

// Private, per-visitor content (reads the cart session cookie) — same
// reasoning as /cart.
export const instant = false;

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const [deliveryMethods, paymentSettings, customerSession] = await Promise.all([
    getActiveDeliveryMethods(),
    getPaymentSettings(),
    getOptionalCustomerSession(),
  ]);

  const customerAddresses = customerSession
    ? await getCustomerAddresses(customerSession.customer.id)
    : [];
  const defaultAddress = customerAddresses.find((a) => a.isDefault) ?? customerAddresses[0] ?? null;

  const prefill = customerSession
    ? {
        firstName: defaultAddress?.firstName ?? customerSession.customer.firstName,
        lastName: defaultAddress?.lastName ?? customerSession.customer.lastName,
        phone: defaultAddress?.phone ?? customerSession.customer.phone ?? "",
        email: customerSession.customer.email,
        state: defaultAddress?.state ?? "",
        city: defaultAddress?.city ?? "",
        address: defaultAddress?.address ?? "",
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutForm
        cart={cart}
        deliveryMethods={deliveryMethods}
        paymentSettings={paymentSettings.values}
        prefill={prefill}
      />
    </div>
  );
}
