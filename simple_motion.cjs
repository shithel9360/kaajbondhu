const fs = require('fs');
const path = 'src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add import
if (!code.includes("import { motion }")) {
  code = code.replace(
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';",
    "import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';\nimport { motion } from 'framer-motion';"
  );
}

// Replace all <section> with <motion.section>
code = code.replace(/<section\b/g, '<motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}');
code = code.replace(/<\/section>/g, '</motion.section>');

// For the first section (Hero), let's make it animate without delay or margin so it pops instantly
code = code.replace(
  '<motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative bg-gradient-to-b',
  '<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative bg-gradient-to-b'
);

fs.writeFileSync(path, code);
console.log('Successfully injected <motion.section> wrappers!');
