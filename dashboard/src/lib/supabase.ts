import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

// Create the Supabase client with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    // Ensure headers are properly set for all requests
    headers: {
      'X-Client-Info': 'supabase-js-2.x',
    },
  },
});

// Log client creation for debugging
console.log('✅ Supabase client initialized', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
});
