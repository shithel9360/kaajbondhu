const fs = require('fs');
const path = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);",
  "const { data, error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId).select();"
);
code = code.replace(
  "if (!error) {\n      toast.info('বুকিং স্ট্যাটাস আপডেট করা হয়েছে।');\n      setAllBookings(allBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));\n    } else toast.error('সমস্যা হয়েছে: ' + error.message);",
  "if (error) toast.error('সমস্যা হয়েছে: ' + error.message);\n    else if (data && data.length > 0) {\n      toast.info('বুকিং স্ট্যাটাস আপডেট করা হয়েছে।');\n      setAllBookings(allBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));\n    } else toast.error('আপডেট ব্যর্থ হয়েছে (অনুমতি নেই)।');"
);

code = code.replace(
  "const { error } = await supabase.from('bookings').update({ payment_status: newStatus }).eq('id', bookingId);",
  "const { data, error } = await supabase.from('bookings').update({ payment_status: newStatus }).eq('id', bookingId).select();"
);
code = code.replace(
  "if (!error) {\n      toast.info('পেমেন্ট স্ট্যাটাস আপডেট করা হয়েছে।');\n      setAllBookings(allBookings.map(b => b.id === bookingId ? { ...b, payment_status: newStatus } : b));\n    } else toast.error('সমস্যা হয়েছে: ' + error.message);",
  "if (error) toast.error('সমস্যা হয়েছে: ' + error.message);\n    else if (data && data.length > 0) {\n      toast.info('পেমেন্ট স্ট্যাটাস আপডেট করা হয়েছে।');\n      setAllBookings(allBookings.map(b => b.id === bookingId ? { ...b, payment_status: newStatus } : b));\n    } else toast.error('আপডেট ব্যর্থ হয়েছে (অনুমতি নেই)।');"
);

fs.writeFileSync(path, code);
