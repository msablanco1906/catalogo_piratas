const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/import logoDassWhite.*?\n/g, '');
code = code.replace(/import logoDass from.*?\n/g, '');
code = code.replace(/import logoFila.*?\n/g, '');
code = code.replace(/import logoUmbro.*?\n/g, '');
code = code.replace(/import logoAsics.*?\n/g, '');
fs.writeFileSync('src/App.tsx', code);
