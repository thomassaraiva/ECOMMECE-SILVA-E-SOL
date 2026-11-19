import { describe, it, expect } from 'vitest';
import { reconcileCart } from './cartReconcile';
import { CartItem, Product } from '../types/ecommerce';

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'p1-M-Azul-default', productId: 'p1', name: 'Sunga', price: 100, quantity: 2, image: '', maxStock: 10, ...over,
});
const product = (over: Partial<Product> = {}): Product => ({
  id: 'p1', name: 'Sunga', slug: 'sunga', description: '', price: 120, isOnSale: false, isFeatured: false, isNew: false,
  isActive: true, categoryId: 'c1', stockQuantity: 10, colors: [], sizes: [], models: [], images: [], ...over,
} as Product);

describe('reconcileCart', () => {
  it('tira da sacola os itens cujo produto não existe mais', () => {
    expect(reconcileCart([item({ productId: 'demo-1' })], [product()])).toEqual([]);
  });

  it('tira da sacola os itens de produto inativo', () => {
    expect(reconcileCart([item()], [product({ isActive: false })])).toEqual([]);
  });

  it('atualiza o preço com o do produto carregado', () => {
    const [it1] = reconcileCart([item({ price: 100, promotionalPrice: 80 })], [product({ price: 120 })]);
    expect(it1.price).toBe(120);
    expect(it1.promotionalPrice).toBeUndefined();
    expect(it1.quantity).toBe(2);
    expect(it1.selectedSize).toBeUndefined();
  });

  it('só leva o preço promocional quando o produto está em oferta', () => {
    const [onSale] = reconcileCart([item()], [product({ isOnSale: true, promotionalPrice: 90 })]);
    expect(onSale.promotionalPrice).toBe(90);
    const [notOnSale] = reconcileCart([item()], [product({ isOnSale: false, promotionalPrice: 90 })]);
    expect(notOnSale.promotionalPrice).toBeUndefined();
  });
});
