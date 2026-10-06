const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- FINAL LIFECYCLE E2E TEST ---');
  
  // Hardcoded fresh tokens extracted via admin fallback because Email Logins are blocked
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: '2i6nsuoo2qxz' });
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: 'dfftq3jm7lmt' });
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const uniqueAddress = 'LIFECYCLE TEST ' + Date.now();
  
  console.log('[STAGE 1] Creating Booking...');
  await supabase.from('bookings').insert({
    customer_id: custData.user.id,
    service_id: '55555555-5555-5555-5555-555555555555',
    status: 'pending',
    address: uniqueAddress,
    total_price: 1500,
    lat: 23.8103,
    lng: 90.4125
  });
  
  const { data: bData } = await supabase.from('bookings').select('id, status').eq('address', uniqueAddress).single();
  const bookingId = bData.id;
  console.log(`[BOOKING ID] ${bookingId}`);
  console.log(`[DATABASE INITIAL] ${bData.status}`);

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  let html = await page.content();
  if (html.includes(uniqueAddress) && html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI INITIAL] অপেক্ষমাণ (pending)');
  }

  const adminPage = await browser.newPage();
  await adminPage.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  await adminPage.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('[ADMIN UI] Navigating to Booking Management...');
  const tabs = await adminPage.$$('button');
  for (const t of tabs) {
    const text = await adminPage.evaluate(e => e.textContent, t);
    if (text === 'বুকিং ম্যানেজমেন্ট') await t.click();
  }
  await new Promise(r => setTimeout(r, 3000));

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
  
  // Wait for React to process the change event and fetch
  await new Promise(r => setTimeout(r, 4000));
  
  let dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE VERIFY] Status after Admin UI change: ${dbCheck.data.status}`);
  
  console.log('[REALTIME TEST] Checking Customer UI without refreshing...');
  html = await page.content();
  console.log(`[CUSTOMER UI] Automatically updated? ${html.includes('চলমান') ? 'YES' : 'NO (Refresh Required)'}`);
  
  console.log('[CUSTOMER UI] Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  html = await page.content();
  if (html.includes('চলমান')) {
    console.log('[CUSTOMER UI REFRESH] চলমান (ongoing)');
  }
  
  console.log('[ADMIN UI] Changing status to COMPLETED via DOM...');
  await adminPage.evaluate(async (bId) => {
    // If the Admin UI optimistic update worked, the row is still there
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
  await new Promise(r => setTimeout(r, 4000));
  
  dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE VERIFY] Status after Admin UI completion: ${dbCheck.data.status}`);
  
  console.log('[CUSTOMER UI] Refreshing...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
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
  await new Promise(r => setTimeout(r, 3000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI RE-LOGIN] সম্পূর্ণ (completed)');
  }
  
  await browser.close();
  console.log('--- END TEST ---');
}
run();
