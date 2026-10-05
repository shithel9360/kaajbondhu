import fs from 'fs';
import path from 'path';

function fixDoubleClassName(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixDoubleClassName(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix instances where <Input className="..." ... className="..."> exists
      // We will look for <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
      // and remove it if there is another className in the same tag.
      
      // Since it's tricky with regex, we can just revert the <Input className="dark..." string to <Input, 
      // and then add it properly to the existing className strings, or just revert and let users add manually.
      
      content = content.replace(/<Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"\s+/g, '<Input ');
      
      // Then for standard styling, we can just append to existing className strings for Input:
      content = content.replace(/<Input([^>]*?)className="([^"]*)"/g, '<Input$1className="$2 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"');
      
      // Also for the auth files where we didn't have a className before, the above revert made them <Input .../>
      // Let's just fix them if they lack className completely
      content = content.replace(/<Input(?![^>]*className=)/g, '<Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

fixDoubleClassName('./src/pages');
