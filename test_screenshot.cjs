const puppeteer = require('puppeteer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.azzvxhgrdnbiwwwnnzxl:Shithel%2602082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const resCust = await client.query(`SELECT r.token FROM auth.refresh_tokens r JOIN auth.sessions s ON r.session_id = s.id WHERE s.user_id = 'c5817b18-f258-4347-b440-61fd4dbab468' AND r.revoked = false ORDER BY r.created_at DESC LIMIT 1`);
  const custToken = resCust.rows[0].token;
  await client.end();
  
  const { data: custData } = await supabase.auth.refreshSession({ refresh_token: custToken });
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://kaajbondhu.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((val) => localStorage.setItem('sb-azzvxhgrdnbiwwwnnzxl-auth-token', val), JSON.stringify(custData.session));
  await page.goto('https://kaajbondhu.vercel.app/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.content();
  console.log('Includes সম্পূর্ণ?', html.includes('সম্পূর্ণ'));
  console.log('Includes সম্পন্ন?', html.includes('সম্পন্ন'));
  
  await browser.close();
}
run();
