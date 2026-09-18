const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We want to remove CompactModeSwitch entirely since it doesn't make sense anymore, 
// and products are just shown sequentially.
code = code.replace(/import \{ CompactModeSwitch \} from '\.\/components\/CompactModeSwitch';\n/g, '');
code = code.replace(/const \[isCompactView, setIsCompactView\] = useState\(true\);\n/g, '');
code = code.replace(/<CompactModeSwitch[^>]*\/>/g, '');

// Fix rendering logic inside Grid (remove variants/compact mapping)
code = code.replace(/\(isCompactView \? groupProductsByModel\(section\.items\) : section\.items\.map\(p => \[p\]\)\)/g, 'section.items.map(p => [p])');

// Fix text displaying Mod/SKUs to just show SKUs
code = code.replace(/\{isCompactView \? \([\s\S]*?\([\s\S]*?SKUs'\}\}\n\s*<\/>\n\s*\) : \(\n\s*<>(\{section.items.length\} \{section.items.length === 1 \? 'SKU' : 'SKUs'\})<\/>\n\s*\)\}/g, '<>$1</>');

// Wait, the regex might be tricky. Let's just string replace the known lines.
code = code.replace(/\{isCompactView \? \([\s\S]*?\} \[\{section\.items\.length === 1 \? 'SKU' : 'SKUs'\}\}\n\s*<\/>\n\s*\) : \(\n\s*<>\(\{section\.items\.length\} \{section\.items\.length === 1 \? 'SKU' : 'SKUs'\}\)<\/>\n\s*\)\}/g, ''); // Need a better replace

fs.writeFileSync('src/App.tsx', code);
