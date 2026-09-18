const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

// The marcas block is somehow still rendering? Let's check for it in the TSX.
code = code.replace(/\{marcas\.length > 0 && setFilterMarca && \([\s\S]*?\}\)/g, '');
// If it's something like {marcas.length > 0 ...}
code = code.replace(/marcas\.length > 0 && setFilterMarca &&/g, 'false &&');

fs.writeFileSync('src/components/MobileFilterDrawer.tsx', code);

// In App.tsx:
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/filterDivision/g, "[]");
fs.writeFileSync('src/App.tsx', app);
