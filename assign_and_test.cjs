const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: provData } = await supabase.auth.refreshSession({ refresh_token: 'gzljaxp5qxh2' });
  const provId = provData.user.id;
  const bookingId = 'ec64d5ca-0dcc-4f46-963f-e4927dcfb580';

  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  // Assign booking to provider
  await client.query('INSERT INTO assignments (booking_id, provider_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [bookingId, provId]);
  
  // Update booking status to ongoing so provider can complete it
  await client.query("UPDATE bookings SET status = 'ongoing' WHERE id = $1", [bookingId]);
  await client.end();
  
  console.log('Provider assigned:', provId);
  
  // Try to update it to completed via API
  const { data, error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId).select();
  console.log('Update result:', data, error);
}
run();
