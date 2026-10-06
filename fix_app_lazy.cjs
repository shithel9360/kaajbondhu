const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard imports with lazy imports for heavy/protected routes
code = code.replace(
  "import ProviderApply from './pages/ProviderApply';",
  "import { lazy, Suspense } from 'react';\nconst ProviderApply = lazy(() => import('./pages/ProviderApply'));"
);
code = code.replace(
  "import AdminDashboard from './pages/AdminDashboard';",
  "const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));"
);

// Wrap Routes with Suspense
code = code.replace(
  /<Routes>/,
  '<Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>}>\n              <Routes>'
);
code = code.replace(
  /<\/Routes>/,
  '</Routes>\n            </Suspense>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App.tsx with lazy loading');
