const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  
  const bookingId = 'ec64d5ca-0dcc-4f46-963f-e4927dcfb580';
  
  // Try to update it to completed via Admin API
  const { data, error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId).select();
  console.log('Update result:', data, error);
}
run();
