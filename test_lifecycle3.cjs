const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- FINAL LIFECYCLE E2E TEST ---');
  
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('[STAGE 1] Customer booking creation...');
  const uniqueAddress = 'LIFECYCLE TEST ' + Date.now();
  
  // Insert without chained .select() to avoid PostgREST RLS quirk
  const { error: insertErr } = await supabase.from('bookings').insert({
    customer_id: custData.user.id,
    service_id: '55555555-5555-5555-5555-555555555555',
    status: 'pending',
    address: uniqueAddress,
    total_price: 1500,
    lat: 23.8103,
    lng: 90.4125
  });
  if (insertErr) { console.error('Insert Error:', insertErr); return; }
  
  // Now SELECT it explicitly
  const { data: bData, error: selErr } = await supabase.from('bookings').select('id').eq('address', uniqueAddress).single();
  if (selErr) { console.error('Select Error:', selErr); return; }
  
  const bookingId = bData.id;
  console.log(`[BOOKING ID] ${bookingId}`);

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  let html = await page.content();
  if (html.includes(uniqueAddress) && html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI] Initial state correctly renders: অপেক্ষমাণ');
  }

  const adminPage = await browser.newPage();
  await adminPage.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  await adminPage.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  const tabs = await adminPage.$$('button');
  for (const t of tabs) {
    const text = await adminPage.evaluate(e => e.textContent, t);
    if (text === 'বুকিং ম্যানেজমেন্ট') await t.click();
  }
  await new Promise(r => setTimeout(r, 3000));

  await adminPage.evaluate(async (bId) => {
    const selects = Array.from(document.querySelectorAll('select'));
    // Find the select associated with our booking ID
    // Look at surrounding tr or parent div
    for (const select of selects) {
      const row = select.closest('tr') || select.closest('div.border');
      if (row && row.textContent.includes(bId)) {
         select.value = 'ongoing';
         const tracker = select._valueTracker;
         if (tracker) tracker.setValue('');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         break;
      }
    }
  }, bookingId);
  
  await new Promise(r => setTimeout(r, 3000));
  
  let dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE] Status after Admin UI change: ${dbCheck.data.status}`);
  
  html = await page.content();
  const isOngoingNow = html.includes('চলমান');
  console.log(`[REALTIME TEST] Customer UI automatically updated? ${isOngoingNow ? 'YES' : 'NO (Refresh Required)'}`);
  
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  html = await page.content();
  if (html.includes('চলমান')) {
    console.log('[CUSTOMER UI] State after refresh: চলমান (ongoing)');
  }
  
  await adminPage.evaluate(async (bId) => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const select of selects) {
      const row = select.closest('tr') || select.closest('div.border');
      if (row && row.textContent.includes(bId)) {
         select.value = 'completed';
         const tracker = select._valueTracker;
         if (tracker) tracker.setValue('');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         break;
      }
    }
  }, bookingId);
  await new Promise(r => setTimeout(r, 3000));
  
  dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE] Status after Admin UI completion: ${dbCheck.data.status}`);
  
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI] State after completion & refresh: সম্পূর্ণ (completed)');
  }
  
  await page.evaluate(() => localStorage.removeItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token'));
  await page.goto('https://kaajbondhu.vercel.app/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI] State after Re-Login: সম্পূর্ণ (completed)');
  }
  
  await browser.close();
  console.log('--- END TEST ---');
}
run();
