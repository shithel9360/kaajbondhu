require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_booking@example.com',
    password: 'password123',
    options: { data: { full_name: 'Test Booker' } }
  });
  if (error) {
    console.error('Signup Error:', error);
    return;
  }
  
  const user = data.user;
  console.log('Test User Created:', user.id);
  
  // Wait a sec for triggers
  await new Promise(r => setTimeout(r, 2000));
  
  // Create booking
  const { data: srvData } = await supabase.from('services').select('id').limit(1);
  const svcId = srvData[0].id;
  
  const { error: insertErr } = await supabase.from('bookings').insert({
    customer_id: user.id,
    service_id: svcId,
    address: '123 Test St',
    lat: 23,
    lng: 90,
    scheduled_at: new Date().toISOString(),
    total_price: 500,
    status: 'pending'
  });
  if (insertErr) console.error('Insert Error:', insertErr);
  
  // Query bookings
  const { data: bData, error: bErr } = await supabase
    .from('bookings')
    .select(`*, services ( name, base_price, pricing_model )`)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });
    
  if (bErr) console.error('Select Error:', bErr);
  console.log('Fetched Bookings:', bData ? bData.length : 'null');
  if (bData && bData.length > 0) {
    console.log(bData[0]);
  }
}
run();
