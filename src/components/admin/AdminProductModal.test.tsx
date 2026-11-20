import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);

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

describe('AdminProductModal - desconto em %', () => {
  const open = () => {
    render(<AdminProductModal isOpen onClose={vi.fn()} productToEdit={product} />);
    fireEvent.click(screen.getByLabelText(/Ativar Preço Promocional/));
    return {
      pct: screen.getByLabelText('Desconto (%)') as HTMLInputElement,
      promo: screen.getByLabelText(/Preço com Desconto/) as HTMLInputElement,
    };
  };

  it('começa desabilitado sem promoção ativa', () => {
    render(<AdminProductModal isOpen onClose={vi.fn()} productToEdit={product} />);
    expect(screen.getByLabelText('Desconto (%)')).toBeDisabled();
  });

  it('digitar o % calcula o preço promocional', () => {
    const { pct, promo } = open();
    fireEvent.change(pct, { target: { value: '20' } });
    expect(promo.value).toBe('103.92');
  });

  it('digitar o preço promocional atualiza o %', () => {
    const { pct, promo } = open();
    fireEvent.change(promo, { target: { value: '99.9' } });
    expect(pct.value).toBe('23.1');
  });

  it('mudar o preço normal recalcula o promocional mantendo o %', () => {
    const { pct, promo } = open();
    fireEvent.change(pct, { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Preço Normal/), { target: { value: '100' } });
    expect(promo.value).toBe('80');
  });

  it('% inválido ao salvar mostra o aviso e marca o campo', () => {
    const { pct } = open();
    fireEvent.change(pct, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Atualizar Produto/ }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Informe um desconto entre 1% e 99%.');
    expect(pct).toHaveAttribute('aria-invalid', 'true');
    expect(pct).toHaveAttribute('aria-describedby', alert.id);
  });
});
