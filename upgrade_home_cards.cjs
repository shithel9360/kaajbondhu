const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// Upgrade the Home Service Cards
code = code.replace(
  /<Card className="h-full group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">/g,
  '<Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgb(37,99,235,0.1)] rounded-[2rem] overflow-hidden">'
);

// Final CTA Button
code = code.replace(
  '<Button size="lg" className="w-full sm:w-auto h-16 px-12 text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-2xl shadow-xl transition-transform hover:-translate-y-1">',
  '<Button size="lg" className="w-full sm:w-auto h-16 px-12 text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.2)] dark:shadow-[0_20px_40px_rgb(37,99,235,0.2)] transition-all hover:-translate-y-1 hover:scale-105">'
);

fs.writeFileSync(path, code);
console.log('Home cards patched for premium style!');
