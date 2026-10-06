const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('--- STARTING LIVE BROWSER TEST ---');
  
  // 1. Authenticate Customer A via API to get session tokens
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'yeanfokir23@gmail.com',
    password: 'KaajBondhu123!'
  });
  if (authErr) {
    console.error('Failed to auth Customer A:', authErr.message);
    return;
  }
  const sessionString = JSON.stringify(authData.session);
  const customerId = authData.user.id;
  console.log(`[TEST 1] Authenticated Customer A: ${customerId}`);
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  
  // Listen for console errors or PostgREST errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Browser Error: ${msg.text()}`);
    }
  });

  // Navigate to live site and inject session
  console.log('Navigating to live production site...');
  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'networkidle2' });
  
  await page.evaluate((key, val) => {
    localStorage.setItem(key, val);
  }, 'sb-azzvxhgrdnbiwwwnnzxl-auth-token', sessionString);
  
  // Reload to apply auth state
  await page.goto('https://kaajbondhu.vercel.app/services', { waitUntil: 'networkidle2' });
  
  // Find a service link
  const serviceLink = await page.$('a[href^="/book/"]');
  if (!serviceLink) {
    console.error('No service found to book.');
    await browser.close();
    return;
  }
  const href = await page.evaluate(el => el.getAttribute('href'), serviceLink);
  const serviceId = href.split('/').pop();
  console.log(`[TEST 1] Found Service to Book: ${serviceId}`);
  
  // Go to booking page
  await page.goto(`https://kaajbondhu.vercel.app${href}`, { waitUntil: 'networkidle2' });
  
  // Fill booking form: date
  console.log('Filling out booking form in browser...');
  const dateInput = await page.$('input[type="datetime-local"]');
  if (dateInput) {
    await dateInput.type('2026-10-15T10:00');
  }
  
  // Address is usually filled automatically if we simulate click on map or it has a default.
  // Wait, the address might be read-only based on geolocation in the code.
  // Let's just evaluate to forcefully enable the submit button if needed or click it.
  // BookService sets address to map click. Let's see if we can trigger the submit.
  
  // We can just click the Book button.
  // The button text is "বুকিং নিশ্চিত করুন"
  const bookBtn = await page.$x("//button[contains(., 'বুকিং নিশ্চিত করুন')]");
  if (bookBtn.length > 0) {
    // We need to bypass the `!address` check. Let's spoof address state in React or just set value.
    // Actually, BookService defaults to user pos if map isn't clicked. BUT address state might be empty.
    // Let's intercept the Supabase fetch request to capture the booking ID when it submits!
  } else {
    console.log('Book button not found!');
  }
  
  await browser.close();
}
run();
