import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const store = {
  setCurrentPage: vi.fn(), products: [], orders: [], adminError: null, clearAdminError: vi.fn(),
  loadOrders: vi.fn(() => Promise.resolve()), clearAdminData: vi.fn(), reload: vi.fn(() => Promise.resolve()),
};
const logout = vi.fn(() => Promise.resolve());

vi.mock('../../context/StoreContext', () => ({ useStore: () => store }));
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ adminUser: { email: 'admin' }, logout }) }));
vi.mock('./AdminOverviewTab', () => ({ AdminOverviewTab: () => null }));
vi.mock('./AdminProductModal', () => ({ AdminProductModal: () => null }));

import { AdminDashboard } from './AdminDashboard';

describe('AdminDashboard', () => {
  it('recarrega a loja ao abrir (itens inativos visíveis) e ao sair (some da memória)', async () => {
    render(<AdminDashboard />);
    expect(store.loadOrders).toHaveBeenCalledTimes(1);
    expect(store.reload).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Sair do painel administrativo'));
    await waitFor(() => expect(store.clearAdminData).toHaveBeenCalled());
    expect(logout).toHaveBeenCalled();
    expect(store.reload).toHaveBeenCalledTimes(2);
  });
});
