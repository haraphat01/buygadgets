import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Contact Us</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Reach out to our office or give us a call — we&apos;re happy to help.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl border p-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Office Address</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Oba Adesida Road, Oja Oba, Akure, Ondo State
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border p-4">
          <Phone className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Phone</p>
            <a
              href="tel:08101061206"
              className="mt-1 block text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              0810 106 1206
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
