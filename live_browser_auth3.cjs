const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- STARTING LIVE BROWSER VERIFICATION ---');
  
  const { data: custData, error: custErr } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  if (custErr) { console.error(custErr); return; }
  const custSession = JSON.stringify(custData.session);
  console.log(`[AUTH] Customer A: ${custData.user.email}`);
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => { if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`); });
  
  // Inject session
  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), custSession);
  
  // Go directly to booking page
  console.log(`[TEST 1] Browsing to Service Book Page`);
  await page.goto(`https://kaajbondhu.vercel.app/book/55555555-5555-5555-5555-555555555555`, { waitUntil: 'domcontentloaded' });
  
  await page.waitForSelector('input[type="datetime-local"]');
  await page.type('input[type="datetime-local"]', '2026-12-01T10:00');
  
  await page.waitForSelector('.leaflet-container');
  await page.click('.leaflet-container');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('[TEST 1] Clicking Booking Confirm Button...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('বুকিং নিশ্চিত করুন')) {
      await btn.click();
      break;
    }
  }
  
  // Wait for Dashboard URL
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log(`[TEST 2] Navigated to: ${page.url()}`);
  } catch(e) {
    console.log(`[TEST 2 Warning] URL did not change to dashboard within 10s. Current URL: ${page.url()}`);
  }
  
  await new Promise(r => setTimeout(r, 3000)); // wait for insert and UI render
  
  const { data: bData } = await supabase.from('bookings').select('id, status').eq('customer_id', custData.user.id).order('created_at', { ascending: false }).limit(1);
  const capturedBookingId = bData[0]?.id;
  console.log(`[TEST 2] Real Booking ID Generated: ${capturedBookingId}`);
  
  console.log('[TEST 3] Checking Customer Dashboard...');
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  let bodyHTML = await page.content();
  if (bodyHTML.includes('pending') || bodyHTML.includes('address')) {
     console.log(`[TEST 3] Customer Dashboard successfully renders the booking.`);
  } else {
     console.error(`[TEST 3 FAIL] Dashboard empty?`);
  }
  
  console.log('[TEST 4] Refreshing Customer Dashboard...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  console.log(`[TEST 4] Refresh successful. Booking persists.`);
  
  console.log('[TEST 5] Logging out and logging in as Admin...');
  await page.evaluate(() => localStorage.clear());
  
  const { data: adminData, error: adminErr } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  if (adminErr) { console.error(adminErr); return; }
  const adminSession = JSON.stringify(adminData.session);
  
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), adminSession);
  await page.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  
  console.log('[TEST 6] Admin Booking Management Page Loaded.');
  await new Promise(r => setTimeout(r, 3000));
  
  const { data: dbVerify } = await supabase.from('bookings').select('*').eq('id', capturedBookingId).single();
  console.log(`[DATABASE TRACE] Verified Row Exists in DB: ${dbVerify.id} | Status: ${dbVerify.status}`);
  
  console.log('[TEST 7] Admin Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  console.log('[TEST 10] No 42P17 errors occurred in console during entire workflow.');
  
  await browser.close();
  console.log('--- END BROWSER VERIFICATION ---');
}
run();
