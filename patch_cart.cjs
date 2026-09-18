const fs = require('fs');

let codeCart = fs.readFileSync('src/components/CartView.tsx', 'utf8');
codeCart = codeCart.replace(
  /'Situacion': item.product.status || '',\n\s*'Talle': size,/m,
  "'Situacion': item.product.status || '',\n            'Descuento': item.product.discount || '0%',\n            'Talle': size,"
);

fs.writeFileSync('src/components/CartView.tsx', codeCart);

