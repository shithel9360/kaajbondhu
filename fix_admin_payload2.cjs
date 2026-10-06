const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

admin = admin.replace(
  "category_id: newService.category_id,",
  "category_id: newService.category_id,\n        is_active: newService.is_active,"
);
// Make sure it doesn't add multiple times, so maybe replace only the first occurrence for update, but insert doesn't need is_active?
// Wait, the insert payload for new service needs is_active? Yes.
fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
