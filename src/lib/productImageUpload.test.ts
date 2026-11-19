import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({ uploadImageToSupabaseStorage: vi.fn() }));

import { uploadImageToSupabaseStorage } from './supabase';
import { uploadProductImage, PRODUCT_UPLOAD_ERROR } from './productImageUpload';

const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });

describe('uploadProductImage', () => {
  beforeEach(() => vi.mocked(uploadImageToSupabaseStorage).mockReset());

  it('envia para o bucket products e devolve o link público', async () => {
    vi.mocked(uploadImageToSupabaseStorage).mockResolvedValue('https://x.supabase.co/storage/v1/object/public/products/a.jpg');
    await expect(uploadProductImage(file, 'produto')).resolves.toMatch(/^https:/);
    expect(uploadImageToSupabaseStorage).toHaveBeenCalledWith(file, 'products', 'produto');
  });

  it('falha com a mensagem do painel quando o envio não dá certo (nada de data URL)', async () => {
    vi.mocked(uploadImageToSupabaseStorage).mockResolvedValue(null);
    await expect(uploadProductImage(file, 'produto')).rejects.toThrow(PRODUCT_UPLOAD_ERROR);
    expect(PRODUCT_UPLOAD_ERROR).toBe('Não foi possível enviar a foto. Tente de novo.');
  });
});
