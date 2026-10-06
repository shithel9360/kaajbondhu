const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: custData, error: custErr } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  if (custErr) throw custErr;
  console.log('User ID:', custData.user.id);
  
  const { data, error } = await supabase.from('bookings').insert({
    customer_id: custData.user.id,
    service_id: '55555555-5555-5555-5555-555555555555',
    address: 'TEST',
    total_price: 1500,
    scheduled_at: new Date().toISOString()
  });
  console.log('Result:', data, error);
}
run();
