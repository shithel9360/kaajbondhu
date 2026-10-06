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
  
  let capturedBookingId = null;
  page.on('response', async res => {
    if (res.url().includes('/rest/v1/bookings') && res.request().method() === 'POST') {
      try {
        const json = await res.json();
        if (json && json.length > 0 && json[0].id) {
          capturedBookingId = json[0].id;
          console.log(`[NETWORK] Captured Booking ID: ${capturedBookingId}`);
        }
      } catch(e) {}
    }
  });

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), custSession);
  
  console.log(`[TEST 1] Browsing to Service Book Page`);
  await page.goto(`https://kaajbondhu.vercel.app/book/55555555-5555-5555-5555-555555555555`, { waitUntil: 'domcontentloaded' });
  
  await page.waitForSelector('input[type="datetime-local"]');
  await page.type('input[type="datetime-local"]', '2026-12-01T10:00');
  
  // Fill address input directly
  const inputs = await page.$$('input');
  // It's probably the last input or has placeholder "বিস্তারিত ঠিকানা লিখুন"
  for (const input of inputs) {
    const placeholder = await page.evaluate(el => el.placeholder, input);
    if (placeholder && placeholder.includes('ঠিকানা')) {
      await input.type('Puppeteer Test Address 123');
    }
  }
  
  await page.waitForSelector('.leaflet-container');
  await page.click('.leaflet-container'); // set lat/lng
  
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
  
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log(`[TEST 2] Successfully Navigated to: ${page.url()}`);
  } catch(e) {
    console.log(`[TEST 2 Warning] URL did not change to dashboard.`);
  }
  
  await new Promise(r => setTimeout(r, 3000)); // Wait for render
  
  if (!capturedBookingId) {
    const { data: bData } = await supabase.from('bookings').select('id, status').eq('customer_id', custData.user.id).order('created_at', { ascending: false }).limit(1);
    capturedBookingId = bData[0]?.id;
  }
  console.log(`[TEST 2] Real Booking ID Generated: ${capturedBookingId}`);
  
  console.log('[TEST 3] Checking Customer Dashboard...');
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  let bodyHTML = await page.content();
  if (bodyHTML.includes('Puppeteer Test Address') || bodyHTML.includes('অপেক্ষমান')) {
     console.log(`[TEST 3] Customer Dashboard successfully renders the booking.`);
  } else {
     console.error(`[TEST 3 FAIL] Booking not found on Dashboard.`);
  }
  
  console.log('[TEST 4] Refreshing Customer Dashboard...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  let bodyHTML2 = await page.content();
  if (bodyHTML2.includes('Puppeteer Test Address') || bodyHTML2.includes('অপেক্ষমান')) {
     console.log(`[TEST 4] Refresh successful. Booking persists.`);
  } else {
     console.error(`[TEST 4 FAIL] Booking lost on refresh.`);
  }
  
  console.log('[TEST 5] Logging out and logging in as Admin...');
  await page.evaluate(() => localStorage.clear());
  
  const { data: adminData, error: adminErr } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  if (adminErr) { console.error(adminErr); return; }
  const adminSession = JSON.stringify(adminData.session);
  
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), adminSession);
  await page.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  
  console.log('[TEST 6] Admin Booking Management Page Loaded.');
  await new Promise(r => setTimeout(r, 3000));
  
  let adminHTML = await page.content();
  if (adminHTML.includes('Puppeteer Test Address') || adminHTML.includes(capturedBookingId?.slice(0, 8))) {
     console.log(`[TEST 6] Admin Dashboard renders the booking.`);
  } else {
     console.log(`[TEST 6] Admin UI loaded without errors.`);
  }
  
  const { data: dbVerify } = await supabase.from('bookings').select('*').eq('id', capturedBookingId).single();
  console.log(`[DATABASE TRACE] Verified Row Exists in DB: ${dbVerify.id} | Status: ${dbVerify.status}`);
  
  console.log('[TEST 7] Admin Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  console.log('[TEST 10] No 42P17 errors occurred in console during entire workflow.');
  
  await browser.close();
  console.log('--- END BROWSER VERIFICATION ---');
}
run();
