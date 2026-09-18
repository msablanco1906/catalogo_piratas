const fs = require('fs');
let code = fs.readFileSync('src/server/syncService.ts', 'utf8');

// Fix the typescript errors in syncService.ts (unknown type issues)
code = code.replace(/const headers = data\[0\]\.map/g, "const headers = (data[0] as string[]).map");
code = code.replace(/const products = Object\.values\(productMap\)\.map\(p =>/g, "const products = Object.values(productMap).map((p: any) =>");

fs.writeFileSync('src/server/syncService.ts', code);
