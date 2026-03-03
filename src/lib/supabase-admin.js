import { createClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

export function getSupabaseAdmin() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co',
    requireEnv('SUPABASE_SERVICE_ROLE_KEY') || 'placeholder-key'
  );
}

export const supabaseAdmin = getSupabaseAdmin();
