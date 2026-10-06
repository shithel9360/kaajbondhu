const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Find the bookings query
const search = `      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(\`*, services ( name, base_price, pricing_model )\`)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (bookingsData) setBookings(bookingsData);`;

const replace = `      const { data: bookingsData, error: bErr } = await supabase
        .from('bookings')
        .select(\`*, services ( name, base_price, pricing_model )\`)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (bErr) console.error('Dashboard Bookings Error:', bErr);
      if (bookingsData) setBookings(bookingsData);`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed Dashboard error swallowing');
