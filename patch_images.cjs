const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports after other imports
const imports = `
import logoDass from './assets/logo-dass.png';
import logoFila from './assets/logo-fila.jpg';
import logoUmbro from './assets/logo-umbro.png';
import logoAsics from './assets/logo-asics.png';
`;
code = code.replace(/import { ProductCard } from '\.\/components\/ProductCard';/, imports.trim() + "\nimport { ProductCard } from './components/ProductCard';");

// Replace usage
code = code.replace(/\/logo-dass\.png/g, "${logoDass}");
code = code.replace(/\/logo-fila\.jpg/g, "${logoFila}");
code = code.replace(/\/logo-umbro\.png/g, "${logoUmbro}");
code = code.replace(/\/logo-asics\.png/g, "${logoAsics}");

// Fix the src string interpolation
code = code.replace(/src="(\$\{logoDass\})"/g, "src={logoDass}");
code = code.replace(/src="(\$\{logoFila\})"/g, "src={logoFila}");
code = code.replace(/src="(\$\{logoUmbro\})"/g, "src={logoUmbro}");
code = code.replace(/src="(\$\{logoAsics\})"/g, "src={logoAsics}");

fs.writeFileSync('src/App.tsx', code);
