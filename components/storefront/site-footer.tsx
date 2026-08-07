// Evaluated once at module load, not per-render — a fixed value the build
// picks up, not a "current time" read Cache Components needs to defer.
const currentYear = new Date().getFullYear();

const linkColumns: { title: string; links: string[] }[] = [
  { title: "Shop", links: ["All Products", "Categories", "Brands", "Flash Sales"] },
  { title: "Support", links: ["Contact Us", "Track Order", "Delivery Info", "Returns"] },
  { title: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"] },
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
        </div>
        {linkColumns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link} className="text-sm text-muted-foreground/70">
                  {link}
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
