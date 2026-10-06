const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update generateOTP function
code = code.replace(
  /const generateOTP = async \(bookingId: string\) => {[\s\S]*?if \(!error\) fetchData\(\);\n  };/,
  `const generateOTP = async (bookingId: string) => {
    const { error } = await supabase.rpc('generate_booking_otp', { target_booking_id: bookingId });
    if (!error) {
      toast.info('OTP কাস্টমারকে পাঠানো হয়েছে।');
      fetchData();
    } else toast.error('OTP জেনারেট করতে সমস্যা হয়েছে: ' + error.message);
  };`
);

// Update verifyOTP function
code = code.replace(
  /const verifyOTP = async \(bookingId: string\) => {[\s\S]*?\} else toast\.info\('ভুল OTP!'\);\n  };/,
  `const verifyOTP = async (bookingId: string) => {
    const code = prompt('কাস্টমারের কাছ থেকে প্রাপ্ত ৬-ডিজিটের OTP লিখুন:');
    if (!code) return;
    const { error } = await supabase.rpc('verify_booking_otp', { target_booking_id: bookingId, submitted_otp: code });
    if (!error) {
      toast.info('OTP ভেরিফাই সফল! কাজ শুরু করুন।');
      fetchData();
    } else toast.error('ভুল OTP বা ভেরিফাই করতে সমস্যা হয়েছে!');
  };`
);

// We need to fetch the secret for the customer so they can see the OTP. 
// Right now, the customer UI relies on b.otp_code. Since b.otp_code is now 'GENERATED' instead of the real value, the customer won't see the real code unless they fetch it.
// To do this, I will add `booking_secrets ( otp_code )` to the customer's fetch query.
code = code.replace(
  "assignments ( provider_id, status, profiles!assignments_provider_profile_fkey ( id, full_name, phone_number, avatar_url, average_rating, total_reviews ) )`)",
  "assignments ( provider_id, status, profiles!assignments_provider_profile_fkey ( id, full_name, phone_number, avatar_url, average_rating, total_reviews ) ), booking_secrets ( otp_code )`)"
);

// And update the display logic for the customer OTP box. 
// Currently it says: b.otp_code
// Change it to: (b.booking_secrets && b.booking_secrets.length > 0 ? b.booking_secrets[0].otp_code : b.otp_code)
code = code.replace(
  /<p className="text-3xl font-mono text-red-600 dark:text-red-300 tracking-widest">\{b\.otp_code\}<\/p>/,
  '<p className="text-3xl font-mono text-red-600 dark:text-red-300 tracking-widest">{b.booking_secrets && b.booking_secrets.length > 0 ? b.booking_secrets[0].otp_code : b.otp_code}</p>'
);

fs.writeFileSync(path, code);
console.log('Frontend patched!');
