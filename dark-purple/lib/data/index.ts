import { supabaseAdapter } from './supabase';
import { mockAdapter } from './mock';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const dataAdapter = USE_MOCK_DATA ? mockAdapter : supabaseAdapter;

export * from './supabase';
export * from './mock';
