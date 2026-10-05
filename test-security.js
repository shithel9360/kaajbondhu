import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('--- STARTING SECURITY TESTS ---');

  const { data: unauthData, error: unauthError } = await supabase.from('bookings').select('*');
  console.log('Test 1 - Unauth Booking Access:', (unauthData?.length === 0 || unauthError) ? 'PASS (Blocked)' : 'FAIL');

  const { error: rpcError } = await supabase.rpc('complete_booking', { target_booking_id: '00000000-0000-0000-0000-000000000000' });
  console.log('Test 2 - Unauth RPC complete_booking:', rpcError ? `PASS (Blocked: ${rpcError.message})` : 'FAIL (Allowed)');

  const { error: otpError } = await supabase.rpc('generate_booking_otp', { target_booking_id: '00000000-0000-0000-0000-000000000000' });
  console.log('Test 3 - Unauth RPC generate_booking_otp:', otpError ? `PASS (Blocked: ${otpError.message})` : 'FAIL (Allowed)');

  const { data: ledgerData, error: ledgerError } = await supabase.from('financial_ledger').update({ amount_poisha: 9999999 }).eq('id', '00000000-0000-0000-0000-000000000000').select();
  console.log('Test 4 - Client Ledger Update:', (ledgerError || ledgerData?.length === 0) ? 'PASS (Blocked / 0 rows)' : 'FAIL (Allowed)');

  console.log('--- TESTS COMPLETE ---');
}

runTests();
