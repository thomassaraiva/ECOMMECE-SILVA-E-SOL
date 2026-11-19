import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../lib/analytics', () => ({
  initializeAnalytics: vi.fn(), trackPageView: vi.fn(), trackViewContent: vi.fn(), trackSearch: vi.fn(),
}));
vi.mock('../lib/storage', async (orig) => {
  const real: any = await orig();
  return {
    ...real,
    StoreService: {
      fetchAll: vi.fn().mockResolvedValue(real.EMPTY_STORE_STATE),
      fetchOrders: vi.fn().mockResolvedValue([{ id: 'o1', orderNumber: 'SS-001', total: 100, items: [] }]),
    },
  };
});

import { StoreProvider, useStore } from './StoreContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;

describe('StoreContext', () => {
  it('clearAdminData tira os pedidos da memória ao sair do painel', async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    await act(async () => { await result.current.loadOrders(); });
    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    act(() => result.current.clearAdminData());
    expect(result.current.orders).toEqual([]);
  });

  it('filteredProducts não mostra produto inativo; products (painel) mostra todos', async () => {
    const { StoreService, EMPTY_STORE_STATE } = await import('../lib/storage');
    const base = { slug: 's', description: '', price: 100, isOnSale: false, isFeatured: false, isNew: false,
      categoryId: 'c1', stockQuantity: 1, colors: [], sizes: [], models: [], images: [] };
    vi.mocked(StoreService.fetchAll).mockResolvedValueOnce({
      ...EMPTY_STORE_STATE,
      products: [{ ...base, id: 'a', name: 'Ativo', isActive: true }, { ...base, id: 'i', name: 'Inativo', isActive: false }] as any,
    });
    const { result } = renderHook(() => useStore(), { wrapper });
    await waitFor(() => expect(result.current.products).toHaveLength(2));
    expect(result.current.filteredProducts.map(p => p.id)).toEqual(['a']);
  });
});
