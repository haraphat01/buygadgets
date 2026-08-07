import { prisma } from "@/lib/prisma";

type DeliveryMethodFields = {
  fee: unknown;
  estimatedDays: string | null;
  pickupAddress: string | null;
  businessHours: string | null;
  active: boolean;
};

const EMPTY: DeliveryMethodFields = {
  fee: 0,
  estimatedDays: null,
  pickupAddress: null,
  businessHours: null,
  active: true,
};

/// Read-only: returns the three delivery method configs, falling back to
/// defaults for any that haven't been saved yet. Rows are only ever
/// created by `updateDeliveryMethods` (actions/delivery.ts) on save —
/// reads never write, so this is safe to call from a page render.
export async function getDeliveryMethods() {
  const rows = await prisma.deliveryMethod.findMany();
  const byType = Object.fromEntries(rows.map((row) => [row.type, row]));

  return {
    buygadgets: (byType.BUYGADGETS as DeliveryMethodFields | undefined) ?? EMPTY,
    gig: (byType.GIG_LOGISTICS as DeliveryMethodFields | undefined) ?? EMPTY,
    pickup: (byType.PICKUP as DeliveryMethodFields | undefined) ?? EMPTY,
  };
}
