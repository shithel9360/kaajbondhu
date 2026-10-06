const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Fix handleEditClick to show Taka instead of Poisha
admin = admin.replace(
  "base_price: service.base_price.toString(),",
  "base_price: (service.base_price / 100).toString(),"
);

// 2. Fix handleSaveService to save as Poisha
admin = admin.replace(
  /base_price: parseInt\(newService\.base_price\),/g,
  "base_price: Math.round(parseFloat(newService.base_price) * 100),"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Fixed base price poisha conversion in AdminDashboard');
