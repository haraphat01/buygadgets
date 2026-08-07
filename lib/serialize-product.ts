/// "use cache" entries must be plain-object serializable — Prisma's
/// Decimal fields (price, discountPrice) aren't, so convert them to
/// numbers before returning from any cached function.
///
/// Also resolves `onFlashSale` here rather than in components: comparing
/// `flashSaleEndsAt` against `new Date()` at render time breaks Cache
/// Components prerendering wherever the product flows into a statically
/// shelled page (e.g. the homepage). Computing it once when the cached
/// value is produced keeps that comparison out of the render path — the
/// "now" baked in is only as stale as the surrounding cacheLife() window.
export function serializeProduct<
  T extends { price: unknown; discountPrice: unknown; flashSaleEndsAt: Date | null },
>(product: T) {
  return {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    onFlashSale: !!(product.discountPrice && product.flashSaleEndsAt && product.flashSaleEndsAt > new Date()),
  };
}
