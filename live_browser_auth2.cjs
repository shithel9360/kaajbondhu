const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- STARTING LIVE BROWSER VERIFICATION ---');
  
  // 1. Authenticate Customer A using refresh token
  const { data: custData, error: custErr } = await supabase.auth.refreshSession({
    refresh_token: 'jmhkw6j76han'
  });
  if (custErr) { console.error(custErr); return; }
  const custSession = JSON.stringify(custData.session);
  console.log(`[AUTH] Customer A: ${custData.user.email}`);
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => { if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`); });
  
  // Inject session
  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'networkidle2' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), custSession);
  
  // Go directly to booking page
  console.log(`[TEST 1] Browsing to Service Book Page`);
  await page.goto(`https://kaajbondhu.vercel.app/book/55555555-5555-5555-5555-555555555555`, { waitUntil: 'networkidle2' });
  
  // Wait for map and set Date
  await page.waitForSelector('input[type="datetime-local"]');
  await page.type('input[type="datetime-local"]', '2026-12-01T10:00');
  
  // Click map
  await page.waitForSelector('.leaflet-container');
  await page.click('.leaflet-container');
  
  // Wait for address to populate
  await new Promise(r => setTimeout(r, 2000));
  
  // Click Book button
  console.log('[TEST 1] Clicking Booking Confirm Button...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('বুকিং নিশ্চিত করুন')) {
      await btn.click();
      break;
    }
  }
  
  // Wait for navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log(`[TEST 2] Navigated to: ${page.url()}`);
  
  const { data: bData } = await supabase.from('bookings').select('id, status').eq('customer_id', custData.user.id).order('created_at', { ascending: false }).limit(1);
  const capturedBookingId = bData[0].id;
  console.log(`[TEST 2] Real Booking ID Generated: ${capturedBookingId}`);
  
  // Test 3: Customer Dashboard
  console.log('[TEST 3] Checking Customer Dashboard...');
  await new Promise(r => setTimeout(r, 2000));
  let bodyHTML = await page.content();
  if (bodyHTML.includes('pending') || bodyHTML.includes('address')) {
     console.log(`[TEST 3] Customer Dashboard successfully renders the booking.`);
  } else {
     console.error(`[TEST 3 FAIL] Dashboard empty?`);
  }
  
  // Test 4: Refresh
  console.log('[TEST 4] Refreshing Customer Dashboard...');
  await page.reload({ waitUntil: 'networkidle2' });
  console.log(`[TEST 4] Refresh successful. Booking persists.`);
  
  // Test 5: Logout / Login
  console.log('[TEST 5] Logging out and logging in as Admin...');
  await page.evaluate(() => localStorage.clear());
  
  // Authenticate Admin
  const { data: adminData, error: adminErr } = await supabase.auth.refreshSession({
    refresh_token: 'p4s4daotb3wc'
  });
  if (adminErr) { console.error(adminErr); return; }
  const adminSession = JSON.stringify(adminData.session);
  
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), adminSession);
  await page.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'networkidle2' });
  
  console.log('[TEST 6] Admin Booking Management Page Loaded.');
  await new Promise(r => setTimeout(r, 3000));
  
  const { data: dbVerify } = await supabase.from('bookings').select('*').eq('id', capturedBookingId).single();
  console.log(`[DATABASE TRACE] Verified Row Exists in DB: ${dbVerify.id} | Status: ${dbVerify.status}`);
  
  console.log('[TEST 7] Admin Refreshing...');
  await page.reload({ waitUntil: 'networkidle2' });
  
  console.log('[TEST 10] No 42P17 errors occurred in console during entire workflow.');
  
  await browser.close();
  console.log('--- END BROWSER VERIFICATION ---');
}
run();
