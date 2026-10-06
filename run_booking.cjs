const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  try {
    const cRes = await client.query('SELECT id FROM auth.users LIMIT 1;');
    const custId = cRes.rows[0].id;
    console.log('Customer:', custId);
    
    const sRes = await client.query('SELECT id FROM public.services LIMIT 1;');
    const svcId = sRes.rows[0].id;
    console.log('Service:', svcId);
    
    const iRes = await client.query(`
      INSERT INTO public.bookings (customer_id, service_id, status, total_price, address)
      VALUES ($1, $2, 'pending', 1000, 'Test Address')
      RETURNING id;
    `, [custId, svcId]);
    const bookId = iRes.rows[0].id;
    console.log('Inserted Booking:', bookId);
    
    const dRes = await client.query(`
      SELECT b.id, s.name 
      FROM public.bookings b
      LEFT JOIN public.services s ON b.service_id = s.id
      WHERE b.customer_id = $1 AND b.id = $2;
    `, [custId, bookId]);
    console.log('Dashboard Query Found:', dRes.rows.length, 'rows');
    
    const aRes = await client.query(`
      SELECT b.id, s.name, p.full_name 
      FROM public.bookings b
      LEFT JOIN public.services s ON b.service_id = s.id
      LEFT JOIN public.profiles p ON b.customer_id = p.id
      WHERE b.id = $1;
    `, [bookId]);
    console.log('Admin Query Found:', aRes.rows.length, 'rows');
    
  } catch(e) { console.error(e); }
  await client.end();
}
run();
