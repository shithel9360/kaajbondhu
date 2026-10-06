const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  try {
    const custId = 'c5817b18-f258-4347-b440-61fd4dbab468'; // I will use a customer this time, not admin
    
    await client.query('BEGIN;');
    await client.query(`
      SET LOCAL ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${custId}", "role": "authenticated"}', true);
    `);
    
    const hRes = await client.query(`SELECT auth.uid() as uid`);
    console.log('auth.uid():', hRes.rows[0].uid);
    
    const roleRes = await client.query(`SELECT public.has_role('customer'::app_role)`);
    console.log('has_role customer?:', roleRes.rows[0].has_role);
    
    const cRes = await client.query(`
      SELECT b.id, b.status 
      FROM public.bookings b
      WHERE b.customer_id = $1;
    `, [custId]);
    console.log('Customer fetched rows:', cRes.rows.length);
    
    await client.query('COMMIT;');
  } catch(e) { console.error(e); }
  
  await client.end();
}
run();
