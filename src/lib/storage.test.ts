import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({ getSupabase: vi.fn() }));

import { getSupabase } from './supabase';
import { StoreService } from './storage';

type Result = { data?: any; error?: any };

function fakeClient(results: Record<string, Result>, fallback: Result = { data: [], error: null }) {
  return {
    from(table: string) {
      const result = results[table] ?? fallback;
      const builder: any = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        upsert: () => builder,
        delete: () => builder,
        eq: () => builder,
        order: () => builder,
        limit: () => builder,
        maybeSingle: () => Promise.resolve(result),
        then: (ok: any, fail: any) => Promise.resolve(result).then(ok, fail),
      };
      return builder;
    },
  };
}

const rlsError = { message: 'new row violates row-level security policy for table "products"', code: '42501' };

describe('StoreService', () => {
  beforeEach(() => vi.mocked(getSupabase).mockReset());

  it('insertProduct lança erro quando o banco recusa', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: null, error: rlsError } }) as any);
    await expect(
      StoreService.insertProduct({ name: 'Sunga', slug: 'sunga', description: 'x', price: 100 } as any)
    ).rejects.toThrow(/Não foi possível salvar/);
  });

  it('updateProduct lança erro quando o banco recusa', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: null, error: rlsError } }) as any);
    await expect(StoreService.updateProduct('p1', { price: 90 })).rejects.toThrow(/Não foi possível salvar/);
  });

  it('deleteProduct lança erro quando o banco recusa', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: null, error: rlsError } }) as any);
    await expect(StoreService.deleteProduct('p1')).rejects.toThrow(/Não foi possível salvar/);
  });

  it('insertProduct devolve o id gerado pelo banco', async () => {
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ products: { data: [{ id: 'uuid-1', created_at: '2026-11-19T00:00:00Z' }], error: null } }) as any
    );
    const created = await StoreService.insertProduct({ name: 'Sunga', slug: 'sunga', description: 'x', price: 100 } as any);
    expect(created.id).toBe('uuid-1');
  });

  it('fetchAll com banco vazio devolve listas vazias, sem produto de exemplo', async () => {
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ store_settings: { data: null, error: null } }, { data: [], error: null }) as any
    );
    const state = await StoreService.fetchAll();
    expect(state.products).toEqual([]);
    expect(state.banners).toEqual([]);
    expect(state.settings.whatsappNumber).toBe('5581920019982');
  });

  it('fetchAll lança erro quando a leitura falha', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: null, error: { message: 'timeout' } } }) as any);
    await expect(StoreService.fetchAll()).rejects.toThrow(/Não foi possível carregar a loja/);
  });

  it('fetchAll lança erro quando o Supabase não está configurado', async () => {
    vi.mocked(getSupabase).mockReturnValue(null);
    await expect(StoreService.fetchAll()).rejects.toThrow(/não está configurada/);
  });
});
