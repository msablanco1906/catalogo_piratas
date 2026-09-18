const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

code = code.replace(/\{groupBy && setGroupBy && \([\s\S]*?\}\)/, '');
code = code.replace(/\{userRole === 'admin' && \(/, '{isAdmin && (');
code = code.replace(/\{marcas\.length > 0 && setFilterMarca && \([\s\S]*?\}\)/, '');
code = code.replace(/\{groupBy && setGroupBy &&/g, '{false &&');
code = code.replace(/\{userRole ===/g, '{isAdmin ===');
code = code.replace(/\{marcas\.length > 0 &&/g, '{false &&');
code = code.replace(/const handleSelectMarca =[\s\S]*?\}\n/g, '');

fs.writeFileSync('src/components/MobileFilterDrawer.tsx', code);
