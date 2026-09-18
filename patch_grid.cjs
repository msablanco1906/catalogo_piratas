const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The JSX for the headers had complex ternary logic. We'll simplify them.
code = code.replace(/\{isCompactView \? \([\s\S]*?\([\s\S]*?SKUs'\}\}\n\s*<\/>\n\s*\) : \(\n\s*<>(\{section\.items\.length\} \{section\.items\.length === 1 \? 'SKU' : 'SKUs'\})<\/>\n\s*\)\}/g, "<>$1</>");

// Clean up total SKUs indicator in desktop header
code = code.replace(/\{isCompactView \? \([\s\S]*?SKUs'\}\}<\/span>\n\s*\) : \(\n\s*<span>(\{filteredProducts\.length\} \{filteredProducts\.length === 1 \? 'SKU' : 'SKUs'\})<\/span>\n\s*\)\}/g, "<span>$1</span>");

// Clean up total SKUs indicator in section headers (PC)
code = code.replace(/\{isCompactView \? \([\s\S]*?SKUs'\}\}\)<\/>\n\s*\) : \(\n\s*<>\(\{section\.items\.length\} \{section\.items\.length === 1 \? 'SKU' : 'SKUs'\}\)<\/>\n\s*\)\}/g, "<>({section.items.length} {section.items.length === 1 ? 'SKU' : 'SKUs'})</>");

// Now remove the groupProductsByModel function from App.tsx since it's unused
code = code.replace(/const groupProductsByModel = [\s\S]*?return result;\n};\n/g, '');

fs.writeFileSync('src/App.tsx', code);
