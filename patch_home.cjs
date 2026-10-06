const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `            {/* Right Content - Abstract Composition */}
            <div className="relative hidden lg:block h-[500px]">
               {/* Soft Abstract Background Elements */}
               <div className="absolute inset-0 bg-blue-100 dark:bg-slate-800 rounded-[3rem] transform rotate-3 scale-95 origin-bottom-right transition-transform hover:rotate-6 duration-700"></div>
               <div className="absolute inset-0 bg-amber-50 dark:bg-slate-700 rounded-[3rem] transform -rotate-2 scale-95 origin-top-left transition-transform hover:-rotate-3 duration-700"></div>
               
               <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative">
                 {/* Instead of a stock photo, we use a clean brand-focused graphic composition representing trusted workers */}
                 <div className="text-center space-y-6">
                    <div className="w-28 h-28 bg-blue-50 dark:bg-slate-700/50 rounded-[2rem] mx-auto flex items-center justify-center rotate-12 shadow-inner border border-blue-100 dark:border-slate-600">
                       <Wrench className="w-14 h-14 text-blue-600 dark:text-blue-400 -rotate-12" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Expert Professionals</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Ready to serve across Dhaka</p>
                    </div>
                 </div>
                 
                 {/* Floating Trust Badges */}
                 <div className="absolute top-12 -left-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 animate-in slide-in-from-left-8 duration-1000 delay-300">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                       <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50 text-sm">NID Verified</p>
                      <p className="text-xs text-slate-500 font-medium">100% Secure</p>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-16 -right-8 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 animate-in slide-in-from-right-8 duration-1000 delay-500">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                       <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50 text-sm">4.9/5 Rating</p>
                      <p className="text-xs text-slate-500 font-medium">Happy Customers</p>
                    </div>
                 </div>
               </div>
            </div>`;

const replacement = `            {/* Right Content - Abstract Composition */}
            <div className="relative mt-12 lg:mt-0 h-[320px] sm:h-[400px] lg:h-[500px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0">
               {/* Soft Abstract Background Elements */}
               <div className="absolute inset-0 bg-blue-100 dark:bg-slate-800 rounded-[2rem] sm:rounded-[3rem] transform rotate-3 scale-95 origin-bottom-right transition-transform hover:rotate-6 duration-700"></div>
               <div className="absolute inset-0 bg-amber-50 dark:bg-slate-700 rounded-[2rem] sm:rounded-[3rem] transform -rotate-2 scale-95 origin-top-left transition-transform hover:-rotate-3 duration-700"></div>
               
               <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                 {/* Instead of a stock photo, we use a clean brand-focused graphic composition representing trusted workers */}
                 <div className="text-center space-y-4 sm:space-y-6 px-4">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-blue-50 dark:bg-slate-700/50 rounded-2xl sm:rounded-[2rem] mx-auto flex items-center justify-center rotate-12 shadow-inner border border-blue-100 dark:border-slate-600">
                       <Wrench className="w-10 h-10 sm:w-14 sm:h-14 text-blue-600 dark:text-blue-400 -rotate-12" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">Expert Professionals</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Ready to serve across Dhaka</p>
                    </div>
                 </div>
                 
                 {/* Floating Trust Badges */}
                 <div className="absolute top-8 sm:top-12 -left-3 sm:-left-6 lg:-left-8 bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-left-8 duration-1000 delay-300">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-full shrink-0">
                       <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50 text-[10px] sm:text-sm leading-tight sm:leading-normal">NID Verified</p>
                      <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-normal">100% Secure</p>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-10 sm:bottom-16 -right-3 sm:-right-6 lg:-right-8 bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-right-8 duration-1000 delay-500">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-full shrink-0">
                       <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50 text-[10px] sm:text-sm leading-tight sm:leading-normal">4.9/5 Rating</p>
                      <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-normal">Happy Customers</p>
                    </div>
                 </div>
               </div>
            </div>`;

if (code.includes('hidden lg:block h-[500px]')) {
  code = code.replace(targetStr, replacement);
  
  // Let's also add overflow-x-hidden to the main layout to be totally safe on very small screens (like iPhone SE)
  // Usually the wrapper is the body, but section works too.
  // The section is <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  // We can add overflow-hidden to it.
  code = code.replace(
    'className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"',
    'className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"'
  );
  
  fs.writeFileSync(path, code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string.");
}
