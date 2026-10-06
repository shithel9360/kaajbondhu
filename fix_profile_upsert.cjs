const fs = require('fs');
let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

profile = profile.replace(
  "    const { error } = await supabase\n      .from('profiles')\n      .update(updatePayload)\n      .eq('id', user.id);",
  "    const { error } = await supabase\n      .from('profiles')\n      .upsert({ id: user.id, ...updatePayload });"
);

fs.writeFileSync('src/pages/Profile.tsx', profile);
console.log('Profile updated to use upsert for OAuth users');
