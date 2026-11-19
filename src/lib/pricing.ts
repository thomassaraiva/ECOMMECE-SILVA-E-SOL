// Preço cobrado: o promocional só vale quando é um número positivo menor que o normal
export function effectivePrice(item: { price: number; promotionalPrice?: number | null }): number {
  const promo = item.promotionalPrice;
  if (promo != null && Number.isFinite(promo) && promo > 0 && promo < item.price) return promo;
  return item.price;
}
