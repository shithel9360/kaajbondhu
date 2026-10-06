const fs = require('fs');
const path = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Upgrade main wrapper and title
code = code.replace(
  '<div className="flex-1 p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 transition-colors">',
  '<div className="flex-1 p-4 md:p-8 lg:p-12 space-y-8 bg-transparent transition-colors min-h-screen">'
);

code = code.replace(
  '<h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">অ্যাডমিন প্যানেল</h1>',
  '<h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">অ্যাডমিন প্যানেল</h1>'
);

// 2. Upgrade Tabs
code = code.replace(
  '<div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">',
  '<div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/50 dark:border-slate-700/50">'
);
code = code.replace(
  /activeTab === 'overview' \? 'bg-blue-100 text-blue-700 dark:bg-blue-900\/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'/g,
  "activeTab === 'overview' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'"
);
code = code.replace(
  /activeTab === 'providers' \? 'bg-blue-100 text-blue-700 dark:bg-blue-900\/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'/g,
  "activeTab === 'providers' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'"
);
code = code.replace(
  /activeTab === 'services' \? 'bg-blue-100 text-blue-700 dark:bg-blue-900\/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'/g,
  "activeTab === 'services' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'"
);
code = code.replace(
  /activeTab === 'bookings' \? 'bg-blue-100 text-blue-700 dark:bg-blue-900\/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'/g,
  "activeTab === 'bookings' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'"
);

// 3. Upgrade Stats Cards (Overview)
code = code.replace(
  /<Card className="border-slate-200 dark:border-slate-800">/g,
  '<Card className="border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:shadow-xl duration-300 rounded-[2rem]">'
);

// Icons inside stats
code = code.replace(
  '<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />',
  '<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30"><Users className="w-6 h-6 text-white" /></div>'
);
code = code.replace(
  '<Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />',
  '<div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30"><Activity className="w-6 h-6 text-white" /></div>'
);
code = code.replace(
  '<Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />',
  '<div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30"><Wallet className="w-6 h-6 text-white" /></div>'
);

fs.writeFileSync(path, code);
console.log('Admin Dashboard patched for premium style!');
