import { createBrowserClient } from '@supabase/ssr';
import { requireEnv } from './env';

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-key';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
