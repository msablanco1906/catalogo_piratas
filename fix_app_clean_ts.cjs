const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There are a lot of missing variables like filterGender, filterLine, filterDivision in App.tsx. 
// They are likely inside handleClearAllFilters and maybe extractFilterOptions or something similar.
// I'll replace any remaining `filterGender`, `filterLine`, `filterDriver`, `filterDiscount`, `filterDivision` uses.
code = code.replace(/filterDivision\.includes\([^)]+\)/g, 'false');
code = code.replace(/filterGender\.includes\([^)]+\)/g, 'false');
code = code.replace(/filterLine\.includes\([^)]+\)/g, 'false');
code = code.replace(/filterDriver\.includes\([^)]+\)/g, 'false');
code = code.replace(/filterDiscount\.includes\([^)]+\)/g, 'false');
code = code.replace(/filterDivision\.length/g, '0');
code = code.replace(/filterGender\.length/g, '0');
code = code.replace(/filterLine\.length/g, '0');
code = code.replace(/filterDriver\.length/g, '0');
code = code.replace(/filterDiscount\.length/g, '0');

// Fix handleClearAllFilters 
code = code.replace(/setFilterDivision\(\[\]\);/g, '');
code = code.replace(/setFilterGender\(\[\]\);/g, '');
code = code.replace(/setFilterLine\(\[\]\);/g, '');
code = code.replace(/setFilterDriver\(\[\]\);/g, '');
code = code.replace(/setFilterDiscount\(\[\]\);/g, '');

fs.writeFileSync('src/App.tsx', code);

// Same for Drawer
let drawer = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');
drawer = drawer.replace(/\{false && \([\s\S]*?\}\)/g, ''); // the previous regex might not have worked due to brackets.
drawer = drawer.replace(/const handleSelectMarca =[\s\S]*?\}\n/g, '');
// Explicitly remove marcas block
drawer = drawer.replace(/\{marcas\.length > 0 && \([\s\S]*?\}\)/, '');
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="Marca"[\s\S]*?\/>/g, '');
fs.writeFileSync('src/components/MobileFilterDrawer.tsx', drawer);

