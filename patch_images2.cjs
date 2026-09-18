const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import logoDass from '\.\/assets\$\{logoDass\}';/, "import logoDass from './assets/logo-dass.png';");
code = code.replace(/import logoFila from '\.\/assets\$\{logoFila\}';/, "import logoFila from './assets/logo-fila.jpg';");
code = code.replace(/import logoUmbro from '\.\/assets\$\{logoUmbro\}';/, "import logoUmbro from './assets/logo-umbro.png';");
code = code.replace(/import logoAsics from '\.\/assets\$\{logoAsics\}';/, "import logoAsics from './assets/logo-asics.png';");

fs.writeFileSync('src/App.tsx', code);
