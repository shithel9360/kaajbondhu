const fs = require('fs');
const path = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `.upsert({ user_id: providerId, role: 'provider' });`,
  `.upsert({ user_id: providerId, role: 'provider' }, { onConflict: 'user_id' });`
);

// We also should fetch providers properly when the role gets updated.
// Currently it just does:
code = code.replace(
  "toast.info('রোল আপডেটে সমস্যা: ' + roleError.message);",
  "toast.error('রোল আপডেটে সমস্যা: ' + roleError.message);"
);

// Change the success toast to explicitly use green success.
code = code.replace(
  "toast.info('প্রোভাইডার সফলভাবে ভেরিফাই করা হয়েছে!');",
  "toast.success('প্রোভাইডার সফলভাবে ভেরিফাই করা হয়েছে!');"
);

fs.writeFileSync(path, code);
