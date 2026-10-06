const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: provData, error: provErr } = await supabase.auth.refreshSession({ refresh_token: 'gzljaxp5qxh2' }); // provider refresh token
  if (provErr) { console.error('Provider auth fail', provErr); return; }
  
  console.log('Provider:', provData.user.email);
  
  // Find an assigned booking
  const { data: assignments } = await supabase.from('assignments').select('booking_id').eq('provider_id', provData.user.id);
  console.log('Assignments:', assignments);
  if (!assignments || assignments.length === 0) return;
  
  const bId = assignments[0].booking_id;
  
  // Try to update it to completed
  const { data, error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bId).select();
  console.log('Update result:', data, error);
}
run();
