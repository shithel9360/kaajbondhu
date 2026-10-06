const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports and variants
if (!code.includes("import { motion }")) {
  code = code.replace(
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';",
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';\nimport { motion } from 'framer-motion';"
  );
}

const variantsCode = `
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };
`;

if (!code.includes('staggerContainer')) {
  code = code.replace(
    'export default function Home() {',
    'export default function Home() {' + variantsCode
  );
}

// 2. Fix the Hero Left Section (Make it motion)
code = code.replace(
  '<div className="text-center lg:text-left z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center lg:text-left z-10">'
);
code = code.replace(
  '              </div>\n\n            {/* Right Content - Animated Hero Visual */}',
  '              </motion.div>\n\n            {/* Right Content - Animated Hero Visual */}'
);

// 3. Fix Hero Right Section
code = code.replace(
  '<div className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">',
  '<motion.div initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">'
);
code = code.replace(
  '            </div>\n            \n          </div>\n        </div>\n      </section>\n\n      {/* Real Statistics',
  '            </motion.div>\n            \n          </div>\n        </div>\n      </section>\n\n      {/* Real Statistics'
);

// 4. Stats Section
code = code.replace(
  '<div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">',
  '<motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="container mx-auto px-4 max-w-7xl">'
);
code = code.replace(
  '          </div>\n        </div>\n      </section>\n\n      {/* Categories',
  '          </div>\n        </motion.div>\n      </section>\n\n      {/* Categories'
);
// Make the stat cards animate individually
code = code.replace(
  '<div className="bg-[#FEF9C3]',
  '<motion.div variants={fadeInUp} className="bg-[#FEF9C3]'
);
code = code.replace(
  '<div className="bg-[#FCE7F3]',
  '<motion.div variants={fadeInUp} className="bg-[#FCE7F3]'
);
code = code.replace(
  '<div className="bg-[#E0F2FE]',
  '<motion.div variants={fadeInUp} className="bg-[#E0F2FE]'
);
code = code.replace(
  '              <p className="text-sm text-amber-900/60 dark:text-amber-200/50 font-medium mt-6">Across Dhaka City</p>\n            </div>',
  '              <p className="text-sm text-amber-900/60 dark:text-amber-200/50 font-medium mt-6">Across Dhaka City</p>\n            </motion.div>'
);
code = code.replace(
  '              <p className="text-sm text-pink-900/60 dark:text-pink-200/50 font-medium mt-6">Skilled & Background-Checked</p>\n            </div>',
  '              <p className="text-sm text-pink-900/60 dark:text-pink-200/50 font-medium mt-6">Skilled & Background-Checked</p>\n            </motion.div>'
);
code = code.replace(
  '              <p className="text-sm text-blue-900/60 dark:text-blue-200/50 font-medium mt-6 max-w-sm">From simple repairs to full renovations, we have experts for everything.</p>\n            </div>',
  '              <p className="text-sm text-blue-900/60 dark:text-blue-200/50 font-medium mt-6 max-w-sm">From simple repairs to full renovations, we have experts for everything.</p>\n            </motion.div>'
);


// 5. Categories Grid (Desktop)
code = code.replace(
  '<div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">'
);
code = code.replace(
  '          </div>\n\n          {/* Mobile Categories - Vertical List',
  '          </motion.div>\n\n          {/* Mobile Categories - Vertical List'
);
// Actually it's easier to just animate the category items by adding variants={fadeInUp} to the Link? No, Link is not a motion element.
// Let's just let the whole container animate up as one block for categories to save time and avoid string replace bugs.
// Oh wait, I replaced the container, but I need children to have variants if it's a staggerContainer! 
// Let's just make it a simple whileInView for the whole block instead of stagger, to avoid breaking JSX.
code = code.replace(
  '<motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">',
  '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">'
);

// Mobile Categories Vertical List wrapper
code = code.replace(
  '<div className="md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="md:hidden flex flex-col gap-4">'
);
code = code.replace(
  '          </div>\n        </div>\n      </section>\n\n      {/* Popular Services',
  '          </motion.div>\n        </div>\n      </section>\n\n      {/* Popular Services'
);

// 6. How it Works Section
code = code.replace(
  '<div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="container mx-auto px-4 max-w-7xl">'
);
code = code.replace(
  '          </div>\n        </div>\n      </section>\n\n      {/* Final CTA',
  '          </div>\n        </motion.div>\n      </section>\n\n      {/* Final CTA'
);

// 7. Final CTA
code = code.replace(
  '<div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-[3rem] p-12 md:p-24 text-center shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">',
  '<motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="bg-[#F8FAFC] dark:bg-slate-800 rounded-[3rem] p-12 md:p-24 text-center shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">'
);
code = code.replace(
  '             </div>\n          </div>\n        </div>\n      </section>',
  '             </div>\n          </motion.div>\n        </div>\n      </section>'
);

fs.writeFileSync(path, code);
console.log('Successfully injected simpler Framer Motion scroll animations into Home.tsx!');
