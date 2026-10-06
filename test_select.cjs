require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const custId = 'ed0e8aaa-1cd4-41b7-8633-b0c6a33bf075';

  const { data, error } = await supabase
    .from('bookings')
    .select(`*, services ( name, base_price, pricing_model )`)
    .eq('customer_id', custId)
    .order('created_at', { ascending: false });
    
  console.log('Customer Query Result:', data ? data.length : 'null');
  if (error) console.error('Customer Error:', error);
  
  const { data: adminData, error: adminErr } = await supabase
    .from('bookings')
    .select('*, services(name), profiles(full_name, phone_number)')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('Admin Query Result:', adminData ? adminData.length : 'null');
  if (adminErr) console.error('Admin Error:', adminErr);
}
run();
