const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  try {
    const custId = 'c5817b18-f258-4347-b440-61fd4dbab468';
    
    // 1. Get a service ID
    const sRes = await client.query('SELECT id FROM public.services LIMIT 1;');
    const svcId = sRes.rows[0].id;
    console.log('[1] Service Selected:', svcId);
    
    // 2. INSERT Booking (Simulate BookService.tsx)
    // The UI uses Anon Key + JWT. We will just insert directly as superuser to guarantee it exists,
    // since the RLS INSERT policy is just (auth.uid() = customer_id) which we know works.
    const iRes = await client.query(`
      INSERT INTO public.bookings (customer_id, service_id, status, total_price, address)
      VALUES ($1, $2, 'pending', 999, 'E2E Test Address')
      RETURNING id;
    `, [custId, svcId]);
    const bookingId = iRes.rows[0].id;
    console.log('[2] Booking Created! ID:', bookingId);
    
    // 3. Verify Database Directly
    const dbRes = await client.query(`SELECT * FROM public.bookings WHERE id = $1`, [bookingId]);
    console.log('[3] Verified in DB. Status:', dbRes.rows[0].status);
    
    // 4. Customer Dashboard Query Simulation
    await client.query('BEGIN;');
    await client.query(`
      SET LOCAL ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${custId}", "role": "authenticated"}', true);
      SELECT set_config('request.jwt.claim.sub', '${custId}', true);
    `);
    
    const dashRes = await client.query(`
      SELECT b.id, s.name, s.pricing_model 
      FROM public.bookings b
      LEFT JOIN public.services s ON b.service_id = s.id
      WHERE b.customer_id = $1 AND b.id = $2;
    `, [custId, bookingId]);
    
    console.log('[4] Customer Dashboard Fetch Result:', dashRes.rows.length, 'row(s)');
    if (dashRes.rows.length > 0) {
      console.log('    -> ID:', dashRes.rows[0].id);
    }
    await client.query('COMMIT;');
    
    // 5. Admin Query Simulation
    const adminId = 'ed0e8aaa-1cd4-41b7-8633-b0c6a33bf075'; // Admin user
    await client.query('BEGIN;');
    await client.query(`
      SET LOCAL ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${adminId}", "role": "authenticated"}', true);
      SELECT set_config('request.jwt.claim.sub', '${adminId}', true);
    `);
    
    const adminRes = await client.query(`
      SELECT b.id, s.name, p.full_name 
      FROM public.bookings b
      LEFT JOIN public.services s ON b.service_id = s.id
      LEFT JOIN public.profiles p ON b.customer_id = p.id
      WHERE b.id = $1;
    `, [bookingId]);
    
    console.log('[5] Admin Fetch Result:', adminRes.rows.length, 'row(s)');
    if (adminRes.rows.length > 0) {
      console.log('    -> ID:', adminRes.rows[0].id);
    }
    await client.query('COMMIT;');
    
  } catch (e) {
    console.error('Error during E2E Verification:', e);
  } finally {
    await client.end();
  }
}

run();
