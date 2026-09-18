const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

// There are empty brackets from regex deletes.
code = code.replace(/\{marcas\.length > 0 && setFilterMarca && \(\s*\)\}/, '');
code = code.replace(/\{groupBy && setGroupBy && \([\s\S]*?\}\)/, '');

fs.writeFileSync('src/components/MobileFilterDrawer.tsx', code);
