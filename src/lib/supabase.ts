import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('placeholder')
);

// Cliente inicializado diretamente pronto para chamadas .from('products').select('*')
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  return supabase;
}

/**
 * Upload seguro de imagem para bucket do Supabase Storage com fallback
 */
export async function uploadImageToSupabaseStorage(
  fileOrBlob: File | Blob,
  bucket: 'products' | 'banners' | 'institutional' = 'banners',
  prefix = 'img'
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const ext = fileOrBlob.type.includes('png') ? 'png' : fileOrBlob.type.includes('webp') ? 'webp' : 'jpg';
    const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: uploadError } = await sb.storage.from(bucket).upload(fileName, fileOrBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: fileOrBlob.type || 'image/jpeg'
    });

    if (uploadError) {
      console.warn(`Aviso de upload Supabase Storage (bucket: ${bucket}):`, uploadError.message);
      return null;
    }

    const { data } = sb.storage.from(bucket).getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.warn(`Erro no upload para Supabase Storage (${bucket}):`, err);
    return null;
  }
}

export default supabase;

