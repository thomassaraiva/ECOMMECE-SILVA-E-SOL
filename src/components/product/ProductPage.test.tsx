import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../lib/analytics', () => ({
  trackViewContent: vi.fn(), trackContactWhatsApp: vi.fn(), trackAddToCart: vi.fn(), trackInitiateCheckout: vi.fn(),
}));
vi.mock('../../context/StoreContext', () => ({
  useStore: () => ({ setCurrentPage: vi.fn(), categories: [], settings: { whatsappNumber: '5581900000000' } }),
}));

import { ProductPage } from './ProductPage';
import { CartProvider, useCart } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { buildWhatsAppOrderUrl } from '../../lib/whatsappOrder';
import { CartItem, Product } from '../../types/ecommerce';

const product: Product = {
  id: 'p1', name: 'Sunga Listrada', slug: 'sunga-listrada', brand: 'Silva e Sol', description: 'Sunga',
  price: 120, isOnSale: false, isFeatured: false, isNew: false, isActive: true, categoryId: 'c1',
  stockQuantity: 10, colors: ['Azul', 'Verde'], sizes: ['P', 'M'], models: ['Lisa', 'Listrada'], images: [],
  variants: [{ id: 'v1', size: 'M', color: 'Verde', model: 'Listrada', stockQuantity: 5, price: 999 } as any],
} as Product;

let cartRef: CartItem[] = [];
const CartSpy = () => { cartRef = useCart().cart; return null; };

function renderPage(p: Product = product) {
  return render(
    <CartProvider>
      <WishlistProvider>
        <ProductPage product={p} />
        <CartSpy />
      </WishlistProvider>
    </CartProvider>
  );
}

describe('ProductPage', () => {
  beforeEach(() => { localStorage.clear(); cartRef = []; });

  it('adiciona à sacola o tamanho, a cor, o modelo e a quantidade escolhidos', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    fireEvent.click(screen.getByRole('button', { name: /Verde/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Listrada$/ }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar à Sacola/ }));

    expect(cartRef).toHaveLength(1);
    expect(cartRef[0]).toMatchObject({ selectedSize: 'M', selectedColor: 'Verde', selectedModel: 'Listrada', quantity: 2 });

    const text = decodeURIComponent(buildWhatsAppOrderUrl(cartRef, { whatsappNumber: '5581900000000' }, { orderNumber: 'X' }).split('text=')[1]);
    expect(text).toContain('Tamanho: M | Cor: Verde | Modelo: Listrada');
    expect(text).toContain('2 un. x R$');
  });

  it('mostra o preço do produto, não o da variação, e nenhuma oferta de parcelamento', () => {
    renderPage({ ...product, sizes: ['M'], colors: ['Verde'], models: ['Listrada'] });
    expect(screen.queryByText(/999/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/120,00/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/sem juros/i)).not.toBeInTheDocument();
  });
});
