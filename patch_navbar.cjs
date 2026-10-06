const fs = require('fs');
const path = 'src/components/Navbar.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '<header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">',
  '<header className="fixed top-4 left-4 right-4 lg:left-8 lg:right-8 xl:max-w-7xl xl:mx-auto z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 rounded-2xl">'
);

// Mobile Dropdown fix because it's now rounded and floating
code = code.replace(
  '<div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-2 flex flex-col p-4 gap-4">',
  '<div className="lg:hidden absolute top-[calc(100%+12px)] left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 flex flex-col p-4 gap-4">'
);

fs.writeFileSync(path, code);
console.log('Navbar patched to floating premium style!');
