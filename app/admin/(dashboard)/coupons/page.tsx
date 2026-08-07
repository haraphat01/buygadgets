import type { Metadata } from "next";

import { listCoupons } from "@/services/coupons";
import { CouponsClient } from "@/components/admin/coupons/coupons-client";

export const metadata: Metadata = {
  title: "Coupons",
};

export default async function CouponsPage() {
  const coupons = await listCoupons();

  return <CouponsClient coupons={coupons} />;
}
