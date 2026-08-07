import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/currency";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import type { ProductDetail } from "@/services/storefront-products";

const SPEC_FIELDS: { key: keyof ProductDetail; label: string }[] = [
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "processor", label: "Processor" },
  { key: "battery", label: "Battery" },
  { key: "camera", label: "Camera" },
  { key: "display", label: "Display" },
  { key: "warranty", label: "Warranty" },
];

function StockBadge({ status }: { status: ProductDetail["stockStatus"] }) {
  if (status === "out") return <Badge variant="destructive">Out of Stock</Badge>;
  if (status === "low") return <Badge variant="secondary">Low Stock</Badge>;
  return <Badge>In Stock</Badge>;
}

export function ProductDetailInfo({
  product,
  isComparing,
  isWishlisted,
}: {
  product: ProductDetail;
  isComparing: boolean;
  isWishlisted: boolean;
}) {
  const specs = SPEC_FIELDS.filter((field) => product[field.key]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        {product.brand ? (
          <p className="text-sm text-muted-foreground">{product.brand.name}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {product.newArrival ? <Badge>New</Badge> : null}
        {product.onFlashSale ? <Badge variant="destructive">Flash Sale</Badge> : null}
        <StockBadge status={product.stockStatus} />
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold">
          {formatNaira(product.discountPrice ?? product.price)}
        </span>
        {product.discountPrice ? (
          <span className="text-lg text-muted-foreground line-through">
            {formatNaira(product.price)}
          </span>
        ) : null}
      </div>

      {product.description ? (
        <p className="text-sm text-muted-foreground">{product.description}</p>
      ) : null}

      {specs.length > 0 ? (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {specs.map((field) => (
                <tr key={field.key} className="border-b last:border-b-0">
                  <td className="w-1/3 px-3 py-2 text-muted-foreground">{field.label}</td>
                  <td className="px-3 py-2">{String(product[field.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ProductPurchasePanel
        productId={product.id}
        variants={product.variants}
        outOfStock={product.stockStatus === "out"}
        isComparing={isComparing}
        isWishlisted={isWishlisted}
      />
    </div>
  );
}
