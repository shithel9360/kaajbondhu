const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Fix dashboard button
content = content.replace(
  'variant="outline" className="font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"',
  'variant="outline" className="font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-50"'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
