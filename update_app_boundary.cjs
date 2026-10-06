const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('ErrorBoundary')) {
  code = code.replace(
    "import { Toaster } from 'sonner';",
    "import { Toaster } from 'sonner';\nimport { ErrorBoundary } from './components/ErrorBoundary';"
  );
  
  code = code.replace(
    "<main className=\"flex-1 flex flex-col\">",
    "<main className=\"flex-1 flex flex-col\">\n            <ErrorBoundary>"
  );
  
  code = code.replace(
    "</Suspense>\n          </main>",
    "</Suspense>\n            </ErrorBoundary>\n          </main>"
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added ErrorBoundary to App.tsx');
}
