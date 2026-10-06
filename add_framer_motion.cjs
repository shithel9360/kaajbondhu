const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add import
if (!code.includes("import { motion } from 'framer-motion';")) {
  code = code.replace(
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';",
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';\nimport { motion } from 'framer-motion';"
  );
}

// Add variants at the top of the component
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

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };
`;

if (!code.includes('staggerContainer')) {
  code = code.replace(
    'export default function Home() {',
    'export default function Home() {' + variantsCode
  );
}

// Patch Hero Left Content
code = code.replace(
  '<div className="text-center lg:text-left z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center lg:text-left z-10">'
);
code = code.replace('</motion.div>\n\n            {/* Right Content', '</div>\n\n            {/* Right Content'); // cleanup if needed
// wait, the closing tag of Hero Left Content is just a </div>. 
// It's safer to just change the opening tag and closing tag precisely, but wait, we can just replace the className.
code = code.replace(
  '<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center lg:text-left z-10">',
  '<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center lg:text-left z-10">'
);
code = code.replace(
  '              </div>\n\n            {/* Right Content',
  '              </motion.div>\n\n            {/* Right Content'
);

// Patch Hero Right Content
code = code.replace(
  '<div className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">',
  '<motion.div initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">'
);
code = code.replace(
  '            </div>\n            \n          </div>\n        </div>\n      </section>',
  '            </motion.div>\n            \n          </div>\n        </div>\n      </section>'
);


// Patch Stats Section
code = code.replace(
  '<div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">',
  '<motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="container mx-auto px-4 max-w-7xl">'
);
code = code.replace(
  '            <div className="bg-[#FEF9C3]',
  '            <motion.div variants={fadeInUp} className="bg-[#FEF9C3]'
);
code = code.replace(
  '            <div className="bg-[#FCE7F3]',
  '            <motion.div variants={fadeInUp} className="bg-[#FCE7F3]'
);
code = code.replace(
  '            <div className="bg-[#E0F2FE]',
  '            <motion.div variants={fadeInUp} className="bg-[#E0F2FE]'
);
// Replace closing divs of stats
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
// Closing div of Stats container
code = code.replace(
  '          </div>\n        </div>\n      </section>\n\n      {/* Categories / Services Section',
  '          </div>\n        </motion.div>\n      </section>\n\n      {/* Categories / Services Section'
);

// Patch Services Section
code = code.replace(
  '<div className="container mx-auto px-4 max-w-7xl">',
  '<div className="container mx-auto px-4 max-w-7xl">'
); // no change to wrapper, let's wrap the grid instead
code = code.replace(
  '          {/* Desktop/Tablet Grid View */}\n          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '          {/* Desktop/Tablet Grid View */}\n          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">'
);
code = code.replace(
  '              <Link key={cat.id} to={`/category/${cat.id}`} className="group block h-full">',
  '              <motion.div key={cat.id} variants={scaleUp} className="h-full"><Link to={`/category/${cat.id}`} className="group block h-full">'
);
code = code.replace(
  '              </Link>\n            ))}',
  '              </Link></motion.div>\n            ))}'
);
code = code.replace(
  '          </div>\n\n          {/* Mobile Categories - Vertical List */}',
  '          </motion.div>\n\n          {/* Mobile Categories - Vertical List */}'
);

// Patch Services Grid (The Individual Service Cards)
code = code.replace(
  '              <div key={categoryName} className="mb-16">\n                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4 inline-block">\n                  {categoryName}\n                </h3>\n                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">',
  '              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} key={categoryName} className="mb-16">\n                <motion.h3 variants={fadeInUp} className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4 inline-block">\n                  {categoryName}\n                </motion.h3>\n                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'
);
code = code.replace(
  '                  {items.map(service => (\n                    <Card key={service.id}',
  '                  {items.map(service => (\n                    <motion.div variants={fadeInUp} key={service.id}><Card'
);
code = code.replace(
  '                          </Link>\n                        </div>\n                      </CardContent>\n                    </Card>\n                  ))}',
  '                          </Link>\n                        </div>\n                      </CardContent>\n                    </Card></motion.div>\n                  ))}'
);
code = code.replace(
  '                </div>\n              </div>',
  '                </div>\n              </motion.div>'
);

// Patch How it Works Section
code = code.replace(
  '<div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">',
  '<motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="container mx-auto px-4 max-w-7xl">'
);
code = code.replace(
  '            {/* Left: Graphic */}\n            <div className="relative',
  '            {/* Left: Graphic */}\n            <motion.div variants={scaleUp} className="relative'
);
code = code.replace(
  '            </div>\n\n            {/* Right: Steps',
  '            </motion.div>\n\n            {/* Right: Steps'
);
// Right steps wrapper
code = code.replace(
  '            <div>\n              <h2 className="text-4xl md:text-5xl',
  '            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>\n              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl'
);
code = code.replace(
  '              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 leading-tight">কীভাবে কাজ করে</h2>',
  '              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 leading-tight">কীভাবে কাজ করে</h2>'
);
code = code.replace(
  '              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">মাত্র কয়েকটি ক্লিকেই পেয়ে যান আপনার কাঙ্ক্ষিত সার্ভিস।</p>',
  '              <motion.p variants={fadeInUp} className="text-lg text-slate-600 dark:text-slate-400 mb-12">মাত্র কয়েকটি ক্লিকেই পেয়ে যান আপনার কাঙ্ক্ষিত সার্ভিস।</motion.p>'
);
code = code.replace(
  '                ].map((step, idx) => (\n                  <div key={idx} className="relative',
  '                ].map((step, idx) => (\n                  <motion.div variants={fadeInUp} key={idx} className="relative'
);
code = code.replace(
  '                    </div>\n                  </div>\n                ))}',
  '                    </div>\n                  </motion.div>\n                ))}'
);
code = code.replace(
  '              </div>\n            </div>\n\n          </div>',
  '              </div>\n            </motion.div>\n\n          </div>'
);
code = code.replace(
  '          </div>\n        </div>\n      </section>\n\n      {/* Final CTA',
  '          </div>\n        </motion.div>\n      </section>\n\n      {/* Final CTA'
);

// Patch Final CTA Section
code = code.replace(
  '        <div className="container mx-auto px-4 max-w-6xl">\n          <div className="bg-[#F8FAFC]',
  '        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="container mx-auto px-4 max-w-6xl">\n          <div className="bg-[#F8FAFC]'
);
code = code.replace(
  '             </div>\n          </div>\n        </div>\n      </section>',
  '             </div>\n          </div>\n        </motion.div>\n      </section>'
);

fs.writeFileSync(path, code);
console.log('Successfully injected Framer Motion scroll animations into Home.tsx!');
