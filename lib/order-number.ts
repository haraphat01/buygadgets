import { randomBytes } from "node:crypto";

/// Random, not sequential — the checkout confirmation page is looked up
/// by order number with no auth, so it shouldn't be guessable.
export function generateOrderNumber(): string {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `BG-${suffix}`;
}
