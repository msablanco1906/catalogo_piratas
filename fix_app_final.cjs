const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the first three lines
const lines = code.split('\n');
lines.splice(0, 3);
code = lines.join('\n');

// Replace correctly
code = code.replace(
  /'Situacion': item.product.status \|\| '',\n\s*'Talle': size,/m,
  "'Situacion': item.product.status || '',\n              'Descuento': item.product.discount || '0%',\n              'Talle': size,"
);

fs.writeFileSync('src/App.tsx', code);
