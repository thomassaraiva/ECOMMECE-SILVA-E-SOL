import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// referência estável: o modal tem efeitos que dependem dessas listas
const store = { categories: [], subcategories: [], addProduct: vi.fn(), updateProduct: vi.fn(), addCategory: vi.fn() };
vi.mock('../../context/StoreContext', () => ({ useStore: () => store }));

import { AdminProductModal } from './AdminProductModal';
import { Product } from '../../types/ecommerce';

const product = {
  id: 'p1', name: 'Sunga Listrada', slug: 'sunga-listrada', brand: 'Silva e Sol', description: 'Sunga',
  price: 129.9, isOnSale: false, isFeatured: false, isNew: false, isActive: true, categoryId: 'c1',
  stockQuantity: 10, colors: [], sizes: [], models: [], images: ['https://x.test/a.jpg'], variants: [],
} as unknown as Product;

describe('AdminProductModal - erro de promoção', () => {
  it('mostra o aviso junto ao botão de salvar e marca o preço promocional', () => {
    render(<AdminProductModal isOpen onClose={vi.fn()} productToEdit={product} />);
    fireEvent.click(screen.getByLabelText(/Ativar Preço Promocional/));
    const promo = screen.getByLabelText(/Preço com Desconto/);
    fireEvent.change(promo, { target: { value: '149.51' } });
    const save = screen.getByRole('button', { name: /Atualizar Produto/ });
    fireEvent.click(save);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('O preço promocional precisa ser menor que o preço normal.');
    expect(alert.parentElement).toContainElement(save);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(promo).toHaveAttribute('aria-invalid', 'true');
    expect(promo).toHaveAttribute('aria-describedby', alert.id);
    expect(screen.getByLabelText(/Preço Normal/)).not.toHaveAttribute('aria-invalid', 'true');
  });
});
