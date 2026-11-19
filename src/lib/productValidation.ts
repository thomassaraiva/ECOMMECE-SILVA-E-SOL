export function validatePromotion(price: number, promotionalPrice?: number | null): string | null {
  if (promotionalPrice == null) return null;
  if (promotionalPrice < 0) return 'O preço promocional não pode ser negativo.';
  if (promotionalPrice >= price) return 'O preço promocional precisa ser menor que o preço normal.';
  return null;
}
