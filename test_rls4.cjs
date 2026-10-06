const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  try {
    await client.query('RESET ROLE;');
    const custId = 'ed0e8aaa-1cd4-41b7-8633-b0c6a33bf075';
    
    await client.query(`
      SET ROLE authenticated;
      SELECT set_config('request.jwt.claims', '{"sub": "${custId}", "role": "authenticated"}', true);
      SELECT set_config('request.jwt.claim.sub', '${custId}', true);
    `);
    
    const hRes = await client.query(`SELECT public.has_role('admin'::app_role)`);
    console.log('has_role admin?:', hRes.rows[0].has_role);
    
  } catch(e) { console.error(e); }
  
  await client.query('RESET ROLE;');
  await client.end();
}
run();
