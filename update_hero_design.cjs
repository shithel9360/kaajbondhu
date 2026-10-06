const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// The block to replace:
const targetBlock = `            {/* Right Content - Abstract Composition */}
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

const stunningBlock = `            {/* Right Content - Animated Hero Visual */}
            <div className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">
              
              {/* Animated Glowing Orbs Background */}
              <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/3 -translate-y-2/3 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite_alternate]"></div>

              {/* Main Center Piece - Glassmorphism Sphere/Card */}
              <div className="relative z-10 w-[260px] sm:w-[320px] lg:w-[360px] aspect-square rounded-full border-[8px] border-white/60 dark:border-slate-800/60 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl flex flex-col items-center justify-center transform transition-transform duration-700 hover:scale-[1.02]">
                
                {/* Inner Animated Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 dark:border-blue-400/10 border-dashed animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-indigo-400/30 dark:border-indigo-400/10 animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* Center Content */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/30 transform rotate-12 transition-all duration-500 hover:rotate-0 hover:scale-110 mb-4 sm:mb-6">
                    <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center leading-none">
                    Trusted<br/>Team
                  </h3>
                  <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-800/50 px-3 sm:px-4 py-1.5 rounded-full shadow-sm">
                    <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                      50+ Expert Professionals
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 - Top Left */}
              <div className="absolute z-20 top-[5%] sm:top-[10%] left-[-5%] sm:left-[5%] lg:-left-[10%] animate-[bounce_4s_ease-in-out_infinite]">
                <div className="bg-white/90 dark:bg-slate-800/90 p-2 sm:p-3 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-3 backdrop-blur-xl">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 sm:p-3 rounded-xl shadow-lg shadow-green-500/20">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="pr-2 sm:pr-4">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Verified</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 leading-none">100% Secure</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 - Bottom Right */}
              <div className="absolute z-20 bottom-[10%] sm:bottom-[15%] right-[-5%] sm:right-[5%] lg:-right-[5%] animate-[bounce_5s_ease-in-out_infinite_alternate]">
                <div className="bg-white/90 dark:bg-slate-800/90 p-2 sm:p-3 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-3 backdrop-blur-xl">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-xl shadow-lg shadow-amber-500/20">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20" />
                  </div>
                  <div className="pr-2 sm:pr-4">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Top Rated</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 leading-none">4.9/5 Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 3 - Bottom Left (Small icon) */}
              <div className="absolute z-10 bottom-[0%] sm:bottom-[5%] left-[5%] sm:left-[15%] lg:left-[0%] animate-[bounce_6s_ease-in-out_infinite]">
                <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center transform -rotate-12">
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Floating Element 4 - Top Right (Small tag) */}
              <div className="absolute z-10 top-[15%] sm:top-[20%] right-[0%] sm:right-[10%] lg:right-[5%] animate-[bounce_3s_ease-in-out_infinite_alternate]">
                <div className="bg-slate-900 dark:bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 flex items-center justify-center transform rotate-6 border border-slate-700 dark:border-blue-500">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide">24/7 Service</span>
                </div>
              </div>

            </div>`;

if (code.includes('Expert Professionals')) {
  code = code.replace(targetBlock, stunningBlock);
  fs.writeFileSync(path, code);
  console.log("Successfully replaced with stunning animated visual!");
} else {
  console.log("Could not find the target block.");
}
