import { formatNaira } from "@/lib/currency";

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function buildOrderWhatsAppMessage({
  customerName,
  phone,
  email,
  deliveryAddress,
  items,
  total,
  deliveryMethodName,
  orderNumber,
  preferredPayment,
}: {
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  items: { name: string; quantity: number }[];
  total: number;
  deliveryMethodName: string;
  orderNumber: string;
  preferredPayment: "Credit Direct" | "Klump";
}): string {
  const productLines = items.map((item) => `- ${item.name} x${item.quantity}`).join("\n");

  return [
    `New order: ${orderNumber}`,
    ``,
    `Customer: ${customerName}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Delivery Address: ${deliveryAddress}`,
    ``,
    `Products:`,
    productLines,
    ``,
    `Total Amount: ${formatNaira(total)}`,
    `Delivery Method: ${deliveryMethodName}`,
    `Order ID: ${orderNumber}`,
    `Preferred Payment: ${preferredPayment}`,
  ].join("\n");
}
