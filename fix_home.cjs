const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

home = home.replace(
  '<Button className="h-14 px-6 sm:px-8 rounded-xl bg-slate-900',
  '<Button onClick={() => { document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }} className="h-14 px-6 sm:px-8 rounded-xl bg-slate-900'
);

home = home.replace(
  'onChange={(e) => setSearch(e.target.value)}',
  'onChange={(e) => setSearch(e.target.value)}\n                  onKeyDown={(e) => { if(e.key === "Enter") document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}'
);

fs.writeFileSync('src/pages/Home.tsx', home);
