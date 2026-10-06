const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

admin = admin.replace(
  /base_price: parseInt\(newService\.base_price\),/g,
  "base_price: parseInt(newService.base_price),\n        discount_percentage: parseInt(newService.discount_percentage.toString()) || 0,\n        offer_text: newService.offer_text,"
);

// We should also display the offer_text on the frontend side in BookService or Home, but first let's just make sure it saves.
fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Payload fixed in AdminDashboard');
