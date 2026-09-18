const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The `return list.sort((a, b) => {` block up to `});`
const regex = /\/\/ Helper to rank Marca & División:[\s\S]*?return \(a\.sku \|\| ''\)\.localeCompare\(b\.sku \|\| ''\);\n\s*\}\);/g;
code = code.replace(regex, `return list.sort((a, b) => {
      const catA = (a.category || '').toUpperCase().trim();
      const catB = (b.category || '').toUpperCase().trim();
      if (catA !== catB) return catA.localeCompare(catB);
      
      const nameA = (a.name || '').toUpperCase().trim();
      const nameB = (b.name || '').toUpperCase().trim();
      return nameA.localeCompare(nameB);
    });`);

fs.writeFileSync('src/App.tsx', code);
