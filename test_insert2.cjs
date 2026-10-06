const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  const { data, error } = await supabase.from('bookings').insert({
    customer_id: custData.user.id,
    service_id: '55555555-5555-5555-5555-555555555555',
    address: 'TEST 2',
    total_price: 1500
  }).select().single();
  console.log('Result:', data, error);
}
run();
