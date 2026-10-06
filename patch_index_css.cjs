const fs = require('fs');
const path = 'src/index.css';
let code = fs.readFileSync(path, 'utf8');

// We will add a nice subtle grid and radial gradient to the body
if (!code.includes('background-image: radial-gradient')) {
  code = code.replace(
    '  body {\n    @apply bg-background text-foreground;\n  }',
    `  body {
    @apply bg-background text-foreground;
    /* Premium subtle noise/gradient mesh effect */
    background-image: radial-gradient(at 0% 0%, hsla(240, 100%, 95%, 0.5) 0px, transparent 50%),
                      radial-gradient(at 100% 0%, hsla(200, 100%, 95%, 0.5) 0px, transparent 50%);
    background-attachment: fixed;
  }
  .dark body {
    background-image: radial-gradient(at 0% 0%, hsla(240, 50%, 10%, 1) 0px, transparent 50%),
                      radial-gradient(at 100% 0%, hsla(200, 50%, 10%, 1) 0px, transparent 50%);
  }`
  );
  fs.writeFileSync(path, code);
  console.log('Added premium global body background!');
}
