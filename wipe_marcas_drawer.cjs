const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

// I will just rip out the handleSelectMarca completely
code = code.replace(/const handleSelectMarca = \([\s\S]*?\}\n/g, '');

// See if there's any other reference
code = code.replace(/filterMarca/g, '[]');
code = code.replace(/setFilterMarca/g, '() => {}');

fs.writeFileSync('src/components/MobileFilterDrawer.tsx', code);
