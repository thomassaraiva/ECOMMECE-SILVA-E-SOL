import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({ getSupabase: vi.fn() }));

import { getSupabase } from './supabase';
import { StoreService } from './storage';
import { settingsFormToPayload, aboutFormToPayload } from './adminForms';

function recordingClient(recorded: { upsert?: any }) {
  return {
    from: () => ({
      upsert: (payload: any) => { recorded.upsert = payload; return Promise.resolve({ error: null }); },
    }),
  };
}

describe('formulários do painel → updateSettings', () => {
  beforeEach(() => vi.mocked(getSupabase).mockReset());

  it('Configurações gravam slogan, troca e envio nas colunas certas', async () => {
    const recorded: { upsert?: any } = {};
    vi.mocked(getSupabase).mockReturnValue(recordingClient(recorded) as any);
    await StoreService.updateSettings(settingsFormToPayload({
      storeName: ' Silva e Sol ', tagline: ' Moda praia ', whatsappNumber: '(81) 9 0000-0000',
      contactEmail: '', instagramHandle: '@silvaesol', freeShippingThreshold: '',
      returnPolicy: ' Troca em 7 dias ', shippingPolicy: ' Envio em 2 dias ', privacyPolicy: 'Privacidade',
      legalName: '', cnpj: '', address: '',
    }));
    expect(recorded.upsert).toMatchObject({
      store_name: 'Silva e Sol', tagline: 'Moda praia', whatsapp_number: '81900000000',
      return_policy: 'Troca em 7 dias', shipping_policy: 'Envio em 2 dias', privacy_policy: 'Privacidade',
      free_shipping_threshold: null,
    });
  });

  it('Sobre Nós grava texto e missão nas colunas certas', async () => {
    const recorded: { upsert?: any } = {};
    vi.mocked(getSupabase).mockReturnValue(recordingClient(recorded) as any);
    await StoreService.updateSettings(aboutFormToPayload({ aboutText: ' Nossa história ', aboutMission: ' Vestir o sol ' }));
    expect(recorded.upsert).toMatchObject({ about_text: 'Nossa história', about_mission: 'Vestir o sol' });
  });
});
