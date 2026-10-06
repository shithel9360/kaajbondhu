const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '<StatusBadge status={b.status} type="booking" />',
  '<StatusBadge status={b.status} type="booking" detailed={true} />'
);

fs.writeFileSync(path, code);
