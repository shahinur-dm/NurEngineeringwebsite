export function formatPrice(price?: number, currency = "BDT") {
  if (price == null) return "Ask for quote";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
