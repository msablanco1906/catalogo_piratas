const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

code = code.replace(/const handleBrandClick = \([\s\S]*?\}\n/g, '');
fs.writeFileSync('src/components/MobileFilterDrawer.tsx', code);
