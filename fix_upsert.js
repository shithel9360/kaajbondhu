const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY); // Using service role to bypass RLS for this isolated DB check if needed, but let's see. Wait, I'll use pg to be sure.
