const fs = require('fs');
let code = fs.readFileSync('src/utils/excel.ts', 'utf8');
code = code.replace(/\\n/g, '\n');
fs.writeFileSync('src/utils/excel.ts', code);
