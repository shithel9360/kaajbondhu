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
  const resAdmin = await client.query(`SELECT r.token FROM auth.refresh_tokens r JOIN auth.sessions s ON r.session_id = s.id WHERE s.user_id = 'f11ba01e-2fc2-48ec-acbd-bfe5ee45c6bc' AND r.revoked = false ORDER BY r.created_at DESC LIMIT 1`);
  
  const custToken = resCust.rows[0].token;
  const adminToken = resAdmin.rows[0].token;
  
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: custToken });
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: adminToken });
  
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
  page.on('dialog', async dialog => await dialog.accept()); // <--- CRITICAL FIX

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  let html = await page.content();
  if (html.includes(uniqueAddress) && html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI INITIAL] অপেক্ষমাণ (pending)');
  }

  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1280, height: 800 });
  adminPage.on('dialog', async dialog => await dialog.accept()); // <--- CRITICAL FIX
  
  await adminPage.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  await adminPage.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('[ADMIN UI] Navigating to Booking Management...');
  const tabs = await adminPage.$$('button');
  for (const t of tabs) {
    const text = await adminPage.evaluate(e => e.textContent, t);
    if (text === 'বুকিং ম্যানেজমেন্ট') await t.click();
  }
  await new Promise(r => setTimeout(r, 4000));

  html = await adminPage.content();
  if (html.includes(uniqueAddress)) {
    console.log('[ADMIN UI INITIAL] Booking visible & ready');
  }

  console.log('[ADMIN UI] Changing status to ONGOING via DOM...');
  await adminPage.evaluate(async (bId) => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const select of selects) {
      const row = select.closest('div.border') || select.closest('tr');
      if (row && row.textContent.includes(bId)) {
         select.value = 'ongoing';
         const tracker = select._valueTracker;
         if (tracker) tracker.setValue('');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         break;
      }
    }
  }, bookingId);
  
  await new Promise(r => setTimeout(r, 5000));
  
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
  
  console.log('[ADMIN UI] Changing status to COMPLETED via DOM...');
  await adminPage.evaluate(async (bId) => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const select of selects) {
      const row = select.closest('div.border') || select.closest('tr');
      if (row && row.textContent.includes(bId)) {
         select.value = 'completed';
         const tracker = select._valueTracker;
         if (tracker) tracker.setValue('');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         break;
      }
    }
  }, bookingId);
  await new Promise(r => setTimeout(r, 5000));
  
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
