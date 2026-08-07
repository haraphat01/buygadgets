import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/services/storefront";

export function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: StorefrontProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
