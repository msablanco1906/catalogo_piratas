const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There are a few remaining undefined variables.
code = code.replace(/\{groupProductsByModel\(section\.items\)\.length === 1 \? 'Mod' : 'Mods'\}/g, "{section.items.length === 1 ? 'SKU' : 'SKUs'}");
code = code.replace(/\{isCompactView \? \([\s\S]*?\([\s\S]*?SKUs'\}\}\n\s*<\/>\n\s*\) : \(\n\s*<>(\{section\.items\.length\} \{section\.items\.length === 1 \? 'SKU' : 'SKUs'\})<\/>\n\s*\)\}/g, "<>$1</>");
code = code.replace(/groupProductsByModel\(section\.items\)/g, 'section.items');
code = code.replace(/groupProductsByModel\(filteredProducts\)/g, 'filteredProducts');
code = code.replace(/isCompactView \?/g, "false ?");

fs.writeFileSync('src/App.tsx', code);
