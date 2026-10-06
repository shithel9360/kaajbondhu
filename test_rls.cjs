const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  try {
    const custId = 'ed0e8aaa-1cd4-41b7-8633-b0c6a33bf075';
    
    // Switch to Authenticated role and set JWT claims
    await client.query(`
      SET ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${custId}", "role": "authenticated"}', true);
    `);
    
    // Simulate Customer Query
    const cRes = await client.query(`
      SELECT b.id, b.status 
      FROM public.bookings b
      WHERE b.customer_id = $1;
    `, [custId]);
    
    console.log('Customer fetched rows:', cRes.rows.length);
    console.log(cRes.rows);
    
    // Test Admin Query (Customer trying to read all bookings)
    const aRes = await client.query(`
      SELECT count(*) FROM public.bookings;
    `);
    console.log('Customer fetches ALL bookings count:', aRes.rows[0].count);
    
  } catch(e) { console.error(e); }
  await client.end();
}
run();
