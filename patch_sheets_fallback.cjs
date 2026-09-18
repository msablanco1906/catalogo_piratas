const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

code = code.replace(/res = await fetch\(gvizUrl\);/, 'res = await fetch(exportUrl);');
fs.writeFileSync('src/lib/sheets.ts', code);
