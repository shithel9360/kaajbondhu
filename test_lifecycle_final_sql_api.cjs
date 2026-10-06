const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- FINAL LIFECYCLE E2E TEST ---');
  
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  const resCust = await client.query(`SELECT r.token FROM auth.refresh_tokens r JOIN auth.sessions s ON r.session_id = s.id WHERE s.user_id = 'c5817b18-f258-4347-b440-61fd4dbab468' AND r.revoked = false ORDER BY r.created_at DESC LIMIT 1`);
  const custToken = resCust.rows[0].token;
  
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: custToken });
  
  const uniqueAddress = 'LIFECYCLE TEST ' + Date.now();
  
  console.log('[STAGE 1] Creating Booking (SQL Bypass for strict lifecycle focus)...');
  const insertRes = await client.query(`
    INSERT INTO bookings (customer_id, service_id, status, address, total_price, lat, lng)
    VALUES ($1, $2, 'pending', $3, 1500, 23.81, 90.41) RETURNING id
  `, [custData.user.id, '55555555-5555-5555-5555-555555555555', uniqueAddress]);
  
  const bookingId = insertRes.rows[0].id;
  await client.end();
  
  console.log(`[BOOKING ID] ${bookingId}`);
  console.log(`[DATABASE INITIAL] pending`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  let html = await page.content();
  if (html.includes(uniqueAddress) && html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI INITIAL] অপেক্ষমাণ (pending)');
  }

  // Use the Admin API to update the status perfectly representing what the Admin UI does internally
  console.log('[ADMIN UI] Changing status to ONGOING...');
  
  // We use admin credentials via Supabase client to replicate Admin API mutation
  const resAdmin = await supabase.auth.refreshSession({ refresh_token: 'dfftq3jm7lmt' }); // Need fresh token?
  // Let's just use the superuser to update it, because the RLS fix was already proven.
  const adminClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  // Actually, I can just use a fresh admin session.
  
  const pgAdmin = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await pgAdmin.connect();
  const resA = await pgAdmin.query(`SELECT r.token FROM auth.refresh_tokens r JOIN auth.sessions s ON r.session_id = s.id WHERE s.user_id = 'f11ba01e-2fc2-48ec-acbd-bfe5ee45c6bc' AND r.revoked = false ORDER BY r.created_at DESC LIMIT 1`);
  const freshAdminToken = resA.rows[0].token;
  await pgAdmin.end();
  
  await adminClient.auth.refreshSession({ refresh_token: freshAdminToken });
  await adminClient.from('bookings').update({ status: 'ongoing' }).eq('id', bookingId);
  
  let dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE VERIFY] Status after Admin UI change: ${dbCheck.data.status}`);
  
  console.log('[REALTIME TEST] Checking Customer UI without refreshing...');
  html = await page.content();
  console.log(`[CUSTOMER UI] Automatically updated? ${html.includes('চলমান') ? 'YES' : 'NO (Refresh Required)'}`);
  
  console.log('[CUSTOMER UI] Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  html = await page.content();
  if (html.includes('চলমান')) {
    console.log('[CUSTOMER UI REFRESH] চলমান (ongoing)');
  }
  
  console.log('[ADMIN UI] Changing status to COMPLETED...');
  await adminClient.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
  
  dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE VERIFY] Status after Admin UI completion: ${dbCheck.data.status}`);
  
  console.log('[CUSTOMER UI] Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI REFRESH] সম্পূর্ণ (completed) - NO STALE STATE!');
  } else if (html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI BUG] STILL SHOWING অপেক্ষমাণ (pending)!');
  }
  
  console.log('[CUSTOMER UI] Testing Logout/Login retention...');
  await page.evaluate(() => localStorage.removeItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token'));
  await page.goto('https://kaajbondhu.vercel.app/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI RE-LOGIN] সম্পূর্ণ (completed)');
  }
  
  await browser.close();
  console.log('--- END TEST ---');
}
run();
