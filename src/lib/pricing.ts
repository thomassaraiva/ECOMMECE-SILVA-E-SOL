// Preço cobrado: o promocional só vale quando é um número positivo menor que o normal
export function effectivePrice(item: { price: number; promotionalPrice?: number | null }): number {
  const promo = item.promotionalPrice;
  if (promo != null && Number.isFinite(promo) && promo > 0 && promo < item.price) return promo;
  return item.price;
}

// Desconto em %: aceita 12,5 ou 12.5; só vale de 0 a 100 (exclusivos), com até 1 casa.
export function parsePercent(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!/^\d+(\.\d)?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n < 100 ? n : null;
}

export function promoFromPercent(price: number, pct: number): number {
  return Math.round(price * (100 - pct)) / 100;
}

// Devolve null quando a promoção não é um valor positivo menor que o preço normal.
export function percentFromPromo(price: number, promo: number): number | null {
  if (!(price > 0) || !(promo > 0) || promo >= price) return null;
  return Math.round(((price - promo) / price) * 1000) / 10;
}
