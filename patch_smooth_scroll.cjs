const fs = require('fs');
const path = 'src/index.css';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('html { scroll-behavior: smooth; }')) {
  code = code.replace(
    '@layer base {',
    `html { scroll-behavior: smooth; }

::selection {
  background: hsla(243, 75%, 59%, 0.3);
  color: inherit;
}
.dark ::selection {
  background: hsla(243, 75%, 69%, 0.3);
}

@layer base {`
  );
  fs.writeFileSync(path, code);
  console.log('Added smooth scrolling and premium text selection!');
}
