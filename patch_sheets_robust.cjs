const fs = require('fs');

function patchParser(content) {
  // Add cache buster to the URL
  let updated = content.replace(
    /const url = \`https:\/\/docs\.google\.com\/spreadsheets\/d\/\$\{stockSheetId\}\/gviz\/tq\?tqx=out:csv&tq=select\%20\*\`;/,
    "const url = `https://docs.google.com/spreadsheets/d/${stockSheetId}/gviz/tq?tqx=out:csv&tq=select%20*&_=${Date.now()}`;"
  );

  // Robust price parser
  const robustParser = `    // Robust price parsing for AR locale
    let cleanPrice = precioRaw.trim();
    let parsedPrecio = 0;
    if (cleanPrice) {
      if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
        const lastDot = cleanPrice.lastIndexOf('.');
        const lastComma = cleanPrice.lastIndexOf(',');
        if (lastComma > lastDot) {
          cleanPrice = cleanPrice.replace(/\\./g, '').replace(',', '.');
        } else {
          cleanPrice = cleanPrice.replace(/,/g, '');
        }
      } else if (cleanPrice.includes(',')) {
        cleanPrice = cleanPrice.replace(',', '.');
      }
      cleanPrice = cleanPrice.replace(/[^0-9.-]/g, '');
      parsedPrecio = parseFloat(cleanPrice) || 0;
    }
    const precio = parsedPrecio;`;

  updated = updated.replace(
    /const precio = parseFloat\(precioRaw\.replace\(\/\[\^0-9\.,\]\/g, ''\)\.replace\(',', '\.'\)\) \|\| 0;/,
    robustParser
  );
  
  return updated;
}

let syncService = fs.readFileSync('src/server/syncService.ts', 'utf8');
fs.writeFileSync('src/server/syncService.ts', patchParser(syncService));

let sheetsTs = fs.readFileSync('src/lib/sheets.ts', 'utf8');
fs.writeFileSync('src/lib/sheets.ts', patchParser(sheetsTs));
