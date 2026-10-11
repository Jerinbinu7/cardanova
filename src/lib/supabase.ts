import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gmoyahcaphzyrkzlcaub.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_lQFKk3PzBmhO58TZ2Ah6TA__F2SqlHq';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '') || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

