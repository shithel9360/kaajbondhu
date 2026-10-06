const fs = require('fs');
let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dash = dash.replace(
  /supabase\.rpc\('accept_booking', \{[\s\S]*?p_provider_id: user\.id\n    \}\)/m,
  "supabase.rpc('accept_booking', {\n      target_booking_id: bookingId\n    })"
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Fixed RPC parameter');
