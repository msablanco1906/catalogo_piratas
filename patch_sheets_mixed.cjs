const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

const mixedLogic = `
  const cacheBustQuery = encodeURIComponent(\`select * where 1=1 and \${ts}=\${ts}\`);
  const gvizUrl = \`https://docs.google.com/spreadsheets/d/\${spreadsheetId}/gviz/tq?tqx=out:csv&tq=\${cacheBustQuery}\${sheetName ? \`&sheet=\${encodeURIComponent(sheetName)}\` : ''}&_=\${ts}\`;
  
  let exportUrl = gvizUrl;
  if (gid) {
      exportUrl = \`https://docs.google.com/spreadsheets/d/\${spreadsheetId}/export?format=csv&gid=\${gid}&_=\${ts}\`;
  }
  
  // Use gviz for Pedidos to bypass cache. Use exportUrl for Hoja 1 because gviz truncates large sheets sometimes.
  const urlToUse = sheetName === 'Pedidos' ? gvizUrl : exportUrl;
`;

code = code.replace(/const cacheBustQuery = encodeURIComponent[\s\S]*?const urlToUse = gvizUrl; \/\/ Change here to prefer gvizUrl/m, mixedLogic.trim());
fs.writeFileSync('src/lib/sheets.ts', code);
