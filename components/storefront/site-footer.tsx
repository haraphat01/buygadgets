import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

// Evaluated once at module load, not per-render — a fixed value the build
// picks up, not a "current time" read Cache Components needs to defer.
const currentYear = new Date().getFullYear();

const linkColumns: { title: string; links: { label: string; href?: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products" },
      { label: "Categories" },
      { label: "Brands" },
      { label: "Flash Sales" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order" },
      { label: "Delivery Info" },
      { label: "Returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us" },
      { label: "Careers" },
      { label: "Privacy Policy" },
      { label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-lg font-semibold tracking-tight">BuyGadgets</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Smartphones, tablets, gadgets and mobile accessories.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>Oba Adesida Road, Oja Oba, Akure, Ondo State</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              <a href="tel:08101061206" className="hover:text-foreground hover:underline">
                0810 106 1206
              </a>
            </li>
          </ul>
        </div>
        {linkColumns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label} className="text-sm text-muted-foreground/70">
                  {link.href ? (
                    <Link href={link.href} className="hover:text-foreground hover:underline">
                      {link.label}
                    </Link>
                  ) : (
                    link.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {currentYear} BuyGadgets. All rights reserved.
      </div>
    </footer>
  );
}
