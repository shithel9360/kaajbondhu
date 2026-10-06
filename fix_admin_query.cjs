const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

admin = admin.replace(
  "const { data: bookingsList } = await supabase.from('bookings').select('*, services(name), customer_id').order('created_at', { ascending: false });",
  "const { data: bookingsList, error } = await supabase.from('bookings').select('*, services(name), profiles(full_name, phone_number)').order('created_at', { ascending: false });\n      if (error) console.error('Admin Bookings Error:', error);"
);

// We need to change where it accesses customer info
admin = admin.replace(
  /b\.customer\?/g,
  "b.profiles?"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Fixed admin query');
