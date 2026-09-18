const fs = require('fs');

// Patch App.tsx
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
codeApp = codeApp.replace(
  /'Situacion': item.product.status || '',\n\s*'Talle': size,/m,
  "'Situacion': item.product.status || '',\n              'Descuento': item.product.discount || '0%',\n              'Talle': size,"
);

// We should also patch Download Excel logic in CartView.tsx or App.tsx (wherever the other download is)
// Actually App.tsx handles email excel, let's see where CartView generates the downloaded one.
fs.writeFileSync('src/App.tsx', codeApp);

// Patch excel.ts
let codeExcel = fs.readFileSync('src/utils/excel.ts', 'utf8');
const colSituacion = "{ header: 'Situacion', key: 'Situacion', width: 15 },";
const colDescuento = "\\n    { header: 'Descuento', key: 'Descuento', width: 15 },";
codeExcel = codeExcel.replace(colSituacion, colSituacion + colDescuento);
fs.writeFileSync('src/utils/excel.ts', codeExcel);

