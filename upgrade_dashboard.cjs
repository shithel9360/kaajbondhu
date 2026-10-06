const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Dashboard wrappers
code = code.replace(
  '<div className="flex-1 p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 transition-colors">',
  '<div className="flex-1 p-4 md:p-8 lg:p-12 space-y-8 bg-transparent transition-colors min-h-screen">'
);

code = code.replace(
  '<h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">আমার ড্যাশবোর্ড</h1>',
  '<h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">আমার ড্যাশবোর্ড</h1>'
);

// Dashboard Cards (like Overview Stats)
code = code.replace(
  /<Card className="border-slate-200 dark:border-slate-800">/g,
  '<Card className="border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:shadow-xl duration-300 rounded-[2rem]">'
);

// Standardize the Icons in Stats for Dashboard too
code = code.replace(
  '<Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />',
  '<div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30"><Briefcase className="w-6 h-6 text-white" /></div>'
);
code = code.replace(
  '<Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />',
  '<div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30"><Wallet className="w-6 h-6 text-white" /></div>'
);

// Improve Booking Cards in the list
code = code.replace(
  '<div key={b.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">',
  '<div key={b.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/60 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">'
);

fs.writeFileSync(path, code);
console.log('Customer/Provider Dashboard patched for premium style!');
