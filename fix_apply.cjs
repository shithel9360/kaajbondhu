const fs = require('fs');
let apply = fs.readFileSync('src/pages/ProviderApply.tsx', 'utf8');

apply = apply.replace(/text-slate-700/g, 'text-slate-900 dark:text-slate-50');
apply = apply.replace(/text-slate-500/g, 'text-slate-600 dark:text-slate-400');
apply = apply.replace(/text-yellow-600/g, 'text-yellow-600 dark:text-yellow-500');
apply = apply.replace(/text-green-600/g, 'text-green-600 dark:text-green-400');
apply = apply.replace(/text-red-600/g, 'text-red-600 dark:text-red-400');
// Also ensure the Card wrapper has text colors
apply = apply.replace(
  '<Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">',
  '<Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">'
);
apply = apply.replace(
  '<Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">',
  '<Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">'
);

fs.writeFileSync('src/pages/ProviderApply.tsx', apply);
