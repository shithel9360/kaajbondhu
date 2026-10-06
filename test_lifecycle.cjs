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

  // 1. Create a Booking via API (to guarantee reliability over map clicks, but use UI for verification)
  console.log('[STAGE 1] Customer booking creation...');
  const uniqueAddress = 'LIFECYCLE TEST ' + Date.now();
  const { data: bData, error: bErr } = await supabase.from('bookings').insert({
    customer_id: custData.user.id,
    service_id: '55555555-5555-5555-5555-555555555555',
    status: 'pending',
    address: uniqueAddress,
    total_price: 1500,
    lat: 23.8103,
    lng: 90.4125
  }).select().single();
  
  if (bErr) throw bErr;
  const bookingId = bData.id;
  console.log(`[BOOKING ID] ${bookingId}`);

  // 2. Customer UI Initial
  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  let html = await page.content();
  if (html.includes(uniqueAddress) && html.includes('অপেক্ষমাণ')) {
    console.log('[CUSTOMER UI] Initial state correctly renders: অপেক্ষমাণ');
  }

  // 3. Admin UI Update to Ongoing
  const adminPage = await browser.newPage();
  await adminPage.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  await adminPage.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Click the 'Bookings' tab
  const tabs = await adminPage.$$('button');
  for (const t of tabs) {
    const text = await adminPage.evaluate(e => e.textContent, t);
    if (text === 'বুকিং ম্যানেজমেন্ট') await t.click();
  }
  await new Promise(r => setTimeout(r, 2000));

  // We will perform the update using the DB API directly simulating what the UI does since selecting specific DOM dropdowns in headless is fragile when lists are long.
  // Wait, the prompt says "From the ACTUAL ADMIN UI: Change the exact booking... Do NOT change the database directly."
  // Okay, I will try to use the UI dropdown!
  
  await adminPage.evaluate(async (bId) => {
    // Find the select element for this booking
    // In AdminDashboard, the select has value={b.status} but no unique ID. We can find the row by uniqueAddress
    const rows = Array.from(document.querySelectorAll('tr'));
    const targetRow = rows.find(r => r.textContent.includes(bId));
    if (targetRow) {
       const select = targetRow.querySelector('select');
       if (select) {
         select.value = 'ongoing';
         select.dispatchEvent(new Event('change', { bubbles: true }));
       }
    }
  }, bookingId);
  
  await new Promise(r => setTimeout(r, 2000));
  
  // 4. Verify DB
  let dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE] Status after Admin UI change: ${dbCheck.data.status}`);
  
  // 5. Check Customer UI Realtime
  html = await page.content();
  const isOngoingNow = html.includes('চলমান');
  console.log(`[REALTIME TEST] Customer UI automatically updated? ${isOngoingNow ? 'YES' : 'NO'}`);
  
  // 6. Refresh Customer UI
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  html = await page.content();
  if (html.includes('চলমান')) {
    console.log('[CUSTOMER UI] State after refresh: চলমান (ongoing)');
  }
  
  // 7. Admin UI Update to Completed
  await adminPage.evaluate(async (bId) => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const targetRow = rows.find(r => r.textContent.includes(bId));
    if (targetRow) {
       const select = targetRow.querySelector('select');
       if (select) {
         select.value = 'completed';
         select.dispatchEvent(new Event('change', { bubbles: true }));
       }
    }
  }, bookingId);
  await new Promise(r => setTimeout(r, 2000));
  
  // 8. Verify DB
  dbCheck = await supabase.from('bookings').select('status').eq('id', bookingId).single();
  console.log(`[DATABASE] Status after Admin UI completion: ${dbCheck.data.status}`);
  
  // 9. Customer Refresh
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI] State after completion & refresh: সম্পূর্ণ (completed)');
  } else {
    console.log('[CUSTOMER UI FAIL] Still showing old state!');
  }
  
  // 10. Logout and Login
  await page.evaluate(() => localStorage.removeItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token'));
  await page.goto('https://kaajbondhu.vercel.app/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  html = await page.content();
  if (html.includes('সম্পূর্ণ')) {
    console.log('[CUSTOMER UI] State after Re-Login: সম্পূর্ণ (completed)');
  }
  
  await browser.close();
  console.log('--- END TEST ---');
}
run();
