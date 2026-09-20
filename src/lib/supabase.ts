import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Suporte universal para Next.js (process.env.NEXT_PUBLIC_*) e Vite (import.meta.env.*)
const supabaseUrl = 
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  ((import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any)?.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  ((import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

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

export default supabase;

