const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/items: items\.sort\(\(a, b\) => \(a\.name \|\| ''\)\.localeCompare\(b\.name \|\| ''\)\)/g, "items: (items as Product[]).sort((a, b) => (a.name || '').localeCompare(b.name || ''))");

fs.writeFileSync('src/App.tsx', code);
