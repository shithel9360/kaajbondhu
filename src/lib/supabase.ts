import { createClient } from '@supabase/supabase-js';

// Hardcoding fallbacks to ensure Vercel never fails even if environment variables are misconfigured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://azzvxhgrdnbiwwwnnzxl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UAI98kAvFLZk_oOPWricmg_ET_8Wdxz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
