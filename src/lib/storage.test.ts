import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({ getSupabase: vi.fn() }));

import { getSupabase } from './supabase';
import { StoreService } from './storage';

type Result = { data?: any; error?: any };

type Recorded = { upsert?: any; update?: any };

function fakeClient(
  results: Record<string, Result>,
  fallback: Result = { data: [], error: null },
  recorded: Recorded = {}
) {
  return {
    from(table: string) {
      const result = results[table] ?? fallback;
      const builder: any = {
        select: () => builder,
        insert: () => builder,
        update: (payload: any) => { recorded.update = payload; return builder; },
        upsert: (payload: any) => { recorded.upsert = payload; return builder; },
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

  it('erro 23514 de preço promocional vira mensagem clara', async () => {
    const checkError = {
      message: 'new row for relation "products" violates check constraint "products_promotional_price_check"',
      code: '23514',
    };
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: null, error: checkError } }) as any);
    await expect(StoreService.updateProduct('p1', { promotionalPrice: 200 })).rejects.toThrow(/menor que o preço normal/);
  });

  it('update barrado (0 linhas afetadas) lança erro', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ products: { data: [], error: null } }) as any);
    await expect(StoreService.updateProduct('p1', { price: 90 })).rejects.toThrow(/sem permissão ou item não encontrado/);
  });

  it('delete barrado (0 linhas afetadas) lança erro', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ banners: { data: [], error: null } }) as any);
    await expect(StoreService.deleteBanner('b1')).rejects.toThrow(/sem permissão ou item não encontrado/);
  });

  it('insert sem linha devolvida lança erro em português', async () => {
    vi.mocked(getSupabase).mockReturnValue(fakeClient({ categories: { data: [], error: null } }) as any);
    await expect(
      StoreService.insertCategory({ name: 'Bonés', slug: 'bones', displayOrder: 1, isActive: true } as any)
    ).rejects.toThrow(/o banco não confirmou a gravação/);
  });

  it('updateProduct grava sku, marca, SEO e limpa o preço promocional', async () => {
    const recorded: any = {};
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ products: { data: [{ id: 'p1' }], error: null } }, undefined, recorded) as any
    );
    await StoreService.updateProduct('p1', {
      sku: 'SS-1', brand: 'Silva e Sol', seoTitle: 'Sunga', promotionalPrice: undefined,
    });
    expect(recorded.update).toMatchObject({ sku: 'SS-1', brand: 'Silva e Sol', seo_title: 'Sunga', promotional_price: null });
  });

  it('updateBanner grava link e texto do botão vazios quando enviados', async () => {
    const recorded: any = {};
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ banners: { data: [{ id: 'b1' }], error: null } }, undefined, recorded) as any
    );
    await StoreService.updateBanner('b1', { ctaLink: '', ctaText: '' });
    expect(recorded.update).toMatchObject({ link_url: '', button_text: '' });
  });

  it('updateBanner usa o padrão quando o campo vem sem valor e não mexe no que não veio', async () => {
    const recorded: any = {};
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ banners: { data: [{ id: 'b1' }], error: null } }, undefined, recorded) as any
    );
    await StoreService.updateBanner('b1', { linkUrl: undefined, title: 'Verão' });
    expect(recorded.update).toEqual({ title: 'Verão', link_url: 'sungas' });
  });

  it('updateSettings grava na linha única id 1', async () => {
    const recorded: any = {};
    vi.mocked(getSupabase).mockReturnValue(fakeClient({}, undefined, recorded) as any);
    await StoreService.updateSettings({ storeName: 'Silva e Sol', freeShippingThreshold: 299 });
    expect(recorded.upsert).toMatchObject({ id: 1, store_name: 'Silva e Sol', free_shipping_threshold: 299 });
  });

  it('updateOrder grava a transportadora do rastreio em tracking_carrier', async () => {
    const recorded: any = {};
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({ orders: { data: [{ id: 'o1' }], error: null } }, undefined, recorded) as any
    );
    await StoreService.updateOrder('o1', { trackingCarrier: 'Correios' });
    expect(recorded.update.tracking_carrier).toBe('Correios');
    expect(recorded.update).not.toHaveProperty('shipping_carrier');
  });

  it('fetchOrders converte as colunas para o formato do pedido', async () => {
    vi.mocked(getSupabase).mockReturnValue(
      fakeClient({
        orders: {
          data: [{
            id: 'o1', order_number: 'SS-001', customer_name: 'Cliente Teste', customer_phone: '0000',
            total: '150.00', shipping_cost: '20.00', status: 'pending_whatsapp', items: [],
            tracking_carrier: 'Correios', created_at: '2026-11-19T00:00:00Z',
          }],
          error: null,
        },
      }) as any
    );
    const [order] = await StoreService.fetchOrders();
    expect(order).toMatchObject({
      id: 'o1', orderNumber: 'SS-001', customerName: 'Cliente Teste', total: 150, shippingCost: 20,
      trackingCarrier: 'Correios', createdAt: '2026-11-19T00:00:00Z',
    });
  });
});
