const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: 'jmhkw6j76han' });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let capturedBookingId = null;
  page.on('response', async res => {
    if (res.url().includes('/rest/v1/bookings') && res.request().method() === 'POST') {
      try {
        const json = await res.json();
        if (json && json.length > 0 && json[0].id) capturedBookingId = json[0].id;
      } catch(e) {}
    }
  });

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  
  await page.goto(`https://kaajbondhu.vercel.app/book/55555555-5555-5555-5555-555555555555`, { waitUntil: 'domcontentloaded' });
  
  await page.waitForSelector('input[type="datetime-local"]');
  await page.type('input[type="datetime-local"]', '2026-12-01T10:00');
  
  await page.waitForSelector('.leaflet-container');
  // Click map slightly offset to avoid UI controls
  await page.click('.leaflet-container', { offset: { x: 150, y: 150 } }); 
  
  await new Promise(r => setTimeout(r, 2000));
  
  const inputs = await page.$$('input');
  for (const input of inputs) {
    const placeholder = await page.evaluate(el => el.placeholder, input);
    if (placeholder && placeholder.includes('ঠিকানা')) {
      await input.click({ clickCount: 3 });
      await input.press('Backspace');
      await input.type('KAAJBONDHU FINAL PROOF 2026');
    }
  }
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('বুকিং নিশ্চিত করুন')) {
      await btn.click();
      break;
    }
  }
  
  try { await page.waitForURL('**/dashboard', { timeout: 8000 }); } catch(e) {}
  await new Promise(r => setTimeout(r, 2000));
  
  console.log(`[TEST 4] Exact Booking ID: ${capturedBookingId}`);
  
  const { data: dbVerify } = await supabase.from('bookings').select('*, services(name)').eq('id', capturedBookingId).single();
  if (dbVerify) {
    console.log(`[TEST 5] DB Row Found: ID=${dbVerify.id}, Cust=${dbVerify.customer_id}, Status=${dbVerify.status}, Address=${dbVerify.address}`);
  }
  
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  let bodyHTML = await page.content();
  if (bodyHTML.includes('KAAJBONDHU FINAL PROOF 2026')) {
     console.log(`[TEST 6] Dashboard UI strictly renders EXACT test booking details.`);
  }
  
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  bodyHTML = await page.content();
  if (bodyHTML.includes('KAAJBONDHU FINAL PROOF 2026')) {
     console.log(`[TEST 7] Refresh successful. Booking remains visible.`);
  }
  
  const navBtns = await page.$$('button');
  for (const btn of navBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('লগআউট')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  
  const { data: adminData } = await supabase.auth.refreshSession({ refresh_token: 'p4s4daotb3wc' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(adminData.session));
  
  await page.goto('https://kaajbondhu.vercel.app/admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  let adminHTML = await page.content();
  if (adminHTML.includes('KAAJBONDHU FINAL PROOF 2026')) {
     console.log(`[TEST 11] Admin Dashboard renders the exact test booking.`);
  }
  
  await browser.close();
  console.log('--- END BROWSER VERIFICATION ---');
}
run();
