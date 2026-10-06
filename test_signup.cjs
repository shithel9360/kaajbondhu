const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_auto_signup@kaajbondhu.com',
    password: 'Password123!',
  });
  console.log('SignUp Result Error:', error?.message || 'No Error');
  console.log('Is User Created?', !!data?.user);
  console.log('Session exists?', !!data?.session);
}
run();
