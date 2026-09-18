const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The multiSelectFilters might still have filter references in active filter badges inside UI.
// We need to strip out badges mapping over filterDivision, filterGender, filterLine, filterDriver.
code = code.replace(/\{filterDivision\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterGender\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterLine\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterDriver\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterDiscount\.length > 0 && \([\s\S]*?\}\)/g, '');

// There is a handleRemoveFilter function which checks for these.
code = code.replace(/if \(type === 'division'\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(type === 'gender'\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(type === 'line'\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(type === 'driver'\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(type === 'discount'\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(type === 'category'\) \{/g, "if (type === 'seccion') {");
code = code.replace(/setFilterCategory/g, "setFilterSeccion");
code = code.replace(/filterCategory/g, "filterSeccion");

// Remove missing references from useEffect dependencies if any
code = code.replace(/, filterDivision/g, '');
code = code.replace(/, filterGender/g, '');
code = code.replace(/, filterLine/g, '');
code = code.replace(/, filterDriver/g, '');
code = code.replace(/, filterDiscount/g, '');

// Also groupProductsByModel and isCompactView inside the grid
code = code.replace(/\{isCompactView \? groupProductsByModel\(section\.items\)\.length : section\.items\.length\}/g, '{section.items.length}');
code = code.replace(/groupProductsByModel\(section\.items\)\.length/g, 'section.items.length');
code = code.replace(/groupProductsByModel\(filteredProducts\)\.length/g, 'filteredProducts.length');

code = code.replace(/isCompactView \? 'Mod' : 'SKU'/g, "'SKU'");
code = code.replace(/isCompactView \? 'Mods' : 'SKUs'/g, "'SKUs'");
code = code.replace(/isCompactView \? 'Modelo' : 'SKU'/g, "'SKU'");
code = code.replace(/isCompactView \? 'Modelos' : 'SKUs'/g, "'SKUs'");

fs.writeFileSync('src/App.tsx', code);
