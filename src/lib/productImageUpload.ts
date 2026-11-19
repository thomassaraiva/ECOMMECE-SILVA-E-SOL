import { uploadImageToSupabaseStorage } from './supabase';

export const PRODUCT_UPLOAD_ERROR = 'Não foi possível enviar a foto. Tente de novo.';

// Foto de produto vai sempre para o Storage: nunca grava a imagem em base64 na linha do produto.
export async function uploadProductImage(file: File | Blob, prefix: string): Promise<string> {
  const url = await uploadImageToSupabaseStorage(file, 'products', prefix);
  if (!url) throw new Error(PRODUCT_UPLOAD_ERROR);
  return url;
}
