import { createClient } from '@supabase/supabase-js';

// Busca chaves do arquivo .env ou do localStorage para flexibilidade de configuração
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('streetlife_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('streetlife_supabase_anon_key') : null;

  const url = (localUrl && localUrl.trim() !== '') ? localUrl.trim() : (envUrl && envUrl.trim() !== '' ? envUrl.trim() : '');
  const anonKey = (localKey && localKey.trim() !== '') ? localKey.trim() : (envKey && envKey.trim() !== '' ? envKey.trim() : '');

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('sua-url-aqui') &&
    !anonKey.includes('sua-chave-anon-publica-aqui') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
};

const initialConfig = getSupabaseConfig();

// Fallback seguro caso ainda não haja chaves definidas
const safeUrl = initialConfig.isConfigured ? initialConfig.url : 'https://placeholder-streetlife.supabase.co';
const safeAnonKey = initialConfig.isConfigured ? initialConfig.anonKey : 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('streetlife_supabase_url', url.trim());
  localStorage.setItem('streetlife_supabase_anon_key', anonKey.trim());
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('streetlife_supabase_url');
  localStorage.removeItem('streetlife_supabase_anon_key');
  window.location.reload();
};
