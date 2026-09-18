const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = "/**\n" + code;
fs.writeFileSync('src/App.tsx', code);
