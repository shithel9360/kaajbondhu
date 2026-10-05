import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// AamarPay Secrets (to be configured in Supabase Edge Secrets)
const AAMARPAY_SIGNATURE_SECRET = Deno.env.get('AAMARPAY_SIGNATURE_SECRET') || 'demo_secret';

serve(async (req) => {
  try {
    const signature = req.headers.get('x-signature') || ''; // Adjust according to AamarPay spec
    const payload = await req.text();
    const data = JSON.parse(payload);

    // 1. Verify Signature (Simulated basic check for demo)
    if (!AAMARPAY_SIGNATURE_SECRET && signature !== 'valid') {
        // Real implementation requires verifying cryptographic hash
        // throw new Error('Invalid webhook signature');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Event Payload Parsing
    // Assuming AamarPay sends something like { pay_status: 'Successful', mer_txnid: 'uuid', amount: '1000' }
    const transactionId = data.mer_txnid;
    const paymentStatus = data.pay_status === 'Successful' ? 'paid' : 'failed';
    const amountStr = data.amount;
    const amountPoisha = Math.round(parseFloat(amountStr) * 100);

    // 3. Idempotency Check
    // If this webhook was already processed, exit safely.
    const { data: existingEvent } = await supabase
      .from('payment_events')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingEvent) {
      return new Response(JSON.stringify({ message: 'Webhook already processed' }), { status: 200 });
    }

    // 4. Fetch Booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, total_price, status')
      .eq('id', transactionId) // Typically the booking ID is the mer_txnid in simple integrations
      .single();

    if (!booking) {
      throw new Error('Booking not found for transaction');
    }

    // 5. Amount Validation (Server-side defense against client tampering)
    if (amountPoisha < booking.total_price) {
      throw new Error(`Amount mismatch. Expected ${booking.total_price}, got ${amountPoisha}`);
    }

    // 6. Record Event & Update Ledger
    // Use an RPC or manual insert for atomicity if needed. Here we insert event and ledger.
    const { error: insertError } = await supabase
      .from('payment_events')
      .insert({
        transaction_id: transactionId,
        booking_id: booking.id,
        status: paymentStatus,
        amount_poisha: amountPoisha,
        raw_payload: data
      });

    if (insertError) throw insertError;

    if (paymentStatus === 'paid') {
      // Example: We log the customer payment into the ledger
      await supabase
        .from('financial_ledger')
        .insert({
          booking_id: booking.id,
          type: 'customer_payment',
          amount_poisha: amountPoisha,
          description: 'AamarPay Online Payment'
        });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
