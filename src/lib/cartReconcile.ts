import { CartItem, Product } from '../types/ecommerce';

// Sacola salva no navegador pode ter itens de demonstração ou preços antigos:
// fica só o que é produto ativo carregado, com o preço atual dele.
export function reconcileCart(cart: CartItem[], products: Product[]): CartItem[] {
  const active = new Map(products.filter(p => p.isActive).map(p => [p.id, p]));
  return cart.flatMap(item => {
    const product = active.get(item.productId);
    if (!product) return [];
    return [{
      ...item,
      name: product.name,
      price: product.price,
      promotionalPrice: product.isOnSale ? product.promotionalPrice : undefined,
    }];
  });
}
