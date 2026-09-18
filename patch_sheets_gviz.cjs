const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

const newLogic = `
  const cacheBustQuery = encodeURIComponent(\`select * where 1=1 and \${ts}=\${ts}\`);
  const gvizUrl = \`https://docs.google.com/spreadsheets/d/\${spreadsheetId}/gviz/tq?tqx=out:csv&tq=\${cacheBustQuery}\${sheetName ? \`&sheet=\${encodeURIComponent(sheetName)}\` : ''}&_=\${ts}\`;
  
  // ALWAYS use gvizUrl first because it bypasses Google's export cache.
  let exportUrl = gvizUrl;
  if (gid) {
      exportUrl = \`https://docs.google.com/spreadsheets/d/\${spreadsheetId}/export?format=csv&gid=\${gid}&_=\${ts}\`;
  }
  
  const urlToUse = gvizUrl; // Change here to prefer gvizUrl
`;

code = code.replace(/const cacheBustQuery = encodeURIComponent[\s\S]*?const urlToUse = exportUrl;/m, newLogic.trim());
fs.writeFileSync('src/lib/sheets.ts', code);
