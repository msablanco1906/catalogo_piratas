const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The active filters array building block
code = code.replace(/\{filterGender\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterLine\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterDriver\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterDiscount\.length > 0 && \([\s\S]*?\}\)/g, '');
code = code.replace(/\{filterDivision\.length > 0 && \([\s\S]*?\}\)/g, '');

code = code.replace(/filterDivision\.map\(\(f\) => \([\s\S]*?\)\)/g, '');
code = code.replace(/filterGender\.map\(\(f\) => \([\s\S]*?\)\)/g, '');
code = code.replace(/filterLine\.map\(\(f\) => \([\s\S]*?\)\)/g, '');
code = code.replace(/filterDriver\.map\(\(f\) => \([\s\S]*?\)\)/g, '');
code = code.replace(/filterDiscount\.map\(\(f\) => \([\s\S]*?\)\)/g, '');

code = code.replace(/\{filterDivision/g, '{false');
code = code.replace(/\{filterGender/g, '{false');
code = code.replace(/\{filterLine/g, '{false');
code = code.replace(/\{filterDriver/g, '{false');
code = code.replace(/\{filterDiscount/g, '{false');

// Handle clear filter refs inside header active filters
code = code.replace(/const \[groupBy, setGroupBy\] = useState\('none'\);\n/g, '');

fs.writeFileSync('src/App.tsx', code);
