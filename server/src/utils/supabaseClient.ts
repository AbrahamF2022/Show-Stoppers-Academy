import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.warn('Supabase credentials are not fully configured.');
}

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'ssa-tutoring-server' } },
  }
);
