const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const hash = '$2a$10$dXSNQwtpOXBAWNJujOYmbekdCUGwwmu6p3SRsGWwll2o6kPFtkL96';
  await client.query(`UPDATE auth.users SET encrypted_password = $1 WHERE email IN ('yeanfokir23@gmail.com', 'admin.kaajbondhu@gmail.com')`, [hash]);
  console.log('Updated passwords successfully.');
  await client.end();
}
run();
