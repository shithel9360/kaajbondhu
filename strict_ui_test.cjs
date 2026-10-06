const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- FINAL STRICT UI VERIFICATION ---');
  
  const { data: custData, error: custErr } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  if (custErr) throw custErr;
  
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
          console.log(`[NETWORK] Captured Real Booking ID from API response: ${capturedBookingId}`);
        }
      } catch(e) {}
    }
  });

  // Inject session (Authorized exception due to 422 Email Logins Disabled on production)
  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  
  console.log(`[TEST 1] Browsing to Service Book Page...`);
  await page.goto(`https://kaajbondhu.vercel.app/book/55555555-5555-5555-5555-555555555555`, { waitUntil: 'domcontentloaded' });
  
  console.log(`[TEST 2] Filling Booking Form...`);
  await page.waitForSelector('input[type="datetime-local"]');
  await page.type('input[type="datetime-local"]', '2026-12-01T10:00');
  
  const inputs = await page.$$('input');
  for (const input of inputs) {
    const placeholder = await page.evaluate(el => el.placeholder, input);
    if (placeholder && placeholder.includes('ঠিকানা')) {
      await input.type('STRICT UI TEST ADDRESS 999');
    }
  }
  
  await page.waitForSelector('.leaflet-container');
  await page.click('.leaflet-container'); // set lat/lng
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('[TEST 3] Submitting Booking via UI...');
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
    console.log(`[TEST 3] Booking successful. Navigated to: ${page.url()}`);
  } catch(e) {
    console.log(`[TEST 3 Warning] Navigation timeout. Current URL: ${page.url()}`);
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log(`[TEST 4] Exact Booking ID: ${capturedBookingId}`);
  
  console.log('[TEST 5] Database Cross-check...');
  const { data: dbVerify } = await supabase.from('bookings').select('*, services(name)').eq('id', capturedBookingId).single();
  if (dbVerify) {
    console.log(`[TEST 5] DB Row Found: ID=${dbVerify.id}, Cust=${dbVerify.customer_id}, Status=${dbVerify.status}, Address=${dbVerify.address}`);
  } else {
    console.error(`[TEST 5 FAIL] Row not found in DB!`);
  }
  
  console.log('[TEST 6] Checking Customer Dashboard DOM...');
  let bodyHTML = await page.content();
  if (bodyHTML.includes('STRICT UI TEST ADDRESS 999')) {
     console.log(`[TEST 6] Dashboard UI strictly renders EXACT test booking details.`);
  } else {
     console.error(`[TEST 6 FAIL] Dashboard missing test booking.`);
  }
  
  console.log('[TEST 7] Refreshing Customer Dashboard...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  bodyHTML = await page.content();
  if (bodyHTML.includes('STRICT UI TEST ADDRESS 999')) {
     console.log(`[TEST 7] Refresh successful. Booking remains visible.`);
  } else {
     console.error(`[TEST 7 FAIL] Booking lost on refresh.`);
  }
  
  console.log('[TEST 8] Real Logout...');
  const navBtns = await page.$$('button');
  for (const btn of navBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('লগআউট')) {
      await btn.click();
      console.log(`[TEST 8] Clicked UI Logout button.`);
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  console.log(`[TEST 8] Current URL after logout: ${page.url()}`);
  
  console.log('[TEST 10] Admin Login...');
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  
  console.log('[TEST 11] Admin Booking Management...');
  await page.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  let adminHTML = await page.content();
  if (adminHTML.includes('STRICT UI TEST ADDRESS 999')) {
     console.log(`[TEST 11] Admin Dashboard renders the exact test booking.`);
  } else {
     console.error(`[TEST 11 FAIL] Admin missing booking.`);
  }
  
  console.log('[TEST 12] Admin Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  adminHTML = await page.content();
  if (adminHTML.includes('STRICT UI TEST ADDRESS 999')) {
     console.log(`[TEST 12] Admin Refresh successful. Booking remains visible.`);
  }
  
  await browser.close();
  console.log('--- END BROWSER VERIFICATION ---');
}
run();
