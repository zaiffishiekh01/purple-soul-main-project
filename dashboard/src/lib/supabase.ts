import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
