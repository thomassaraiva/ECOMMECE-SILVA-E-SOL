export function validatePromotion(
  price: number,
  promotionalPrice?: number | null,
  options?: { required?: boolean },
): string | null {
  if (options?.required) {
    if (!Number.isFinite(price) || price <= 0) return 'Informe um preço válido.';
    if (promotionalPrice == null || !Number.isFinite(promotionalPrice) || promotionalPrice === 0) {
      return 'Informe um preço promocional válido.';
    }
  }
  if (promotionalPrice == null) return null;
  if (promotionalPrice < 0) return 'O preço promocional não pode ser negativo.';
  if (promotionalPrice >= price) return 'O preço promocional precisa ser menor que o preço normal.';
  return null;
}
