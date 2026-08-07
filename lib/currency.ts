const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number | string): string {
  return formatter.format(Number(amount));
}
