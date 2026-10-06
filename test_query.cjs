const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
// VITE_SUPABASE_ANON_KEY
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Without login, I can't test RLS accurately for admins.
