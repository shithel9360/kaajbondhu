const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  try {
    const adminId = 'ed0e8aaa-1cd4-41b7-8633-b0c6a33bf075';
    
    await client.query('BEGIN;');
    await client.query(`
      SET LOCAL ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${adminId}", "role": "authenticated"}', true);
    `);
    
    const hRes = await client.query(`SELECT public.has_role('admin'::app_role)`);
    console.log('has_role admin?:', hRes.rows[0].has_role);
    
    const aRes = await client.query(`
      SELECT b.id, s.name, p.full_name 
      FROM public.bookings b
      LEFT JOIN public.services s ON b.service_id = s.id
      LEFT JOIN public.profiles p ON b.customer_id = p.id;
    `);
    console.log('Admin fetched rows:', aRes.rows.length);
    
    await client.query('COMMIT;');
  } catch(e) { console.error(e); }
  
  await client.end();
}
run();
