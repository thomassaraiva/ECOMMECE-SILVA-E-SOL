import { createClient } from '@supabase/supabase-js';

// Suporte universal para Next.js (process.env.NEXT_PUBLIC_*) e Vite (import.meta.env.*)
const supabaseUrl = 
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)) ||
  '';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

// Cria o cliente Supabase pronto para uso em todo o app
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return supabase;
}

export default supabase;
