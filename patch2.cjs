const fs = require('fs');
let code = fs.readFileSync('update-firebase.ts', 'utf8');

code = code.replace(
`      let name = descIdx !== -1 ? String(row[descIdx]).trim() : '';
      if (colorDesc) name += \` - \${colorDesc}\`;
      if (!name && modelo) name = modelo;
      if (!name) name = \`Product \${id}\`;
      const category = catIdx !== -1 ? String(row[catIdx]).trim() : '';
      const gender = genIdx !== -1 ? String(row[genIdx]).trim() : '';
      const line = lineIdx !== -1 ? String(row[lineIdx]).trim() : '';
      const driver = driverIdx !== -1 ? String(row[driverIdx]).trim() : '';
      const colorDesc = colorDescIdx !== -1 ? String(row[colorDescIdx]).trim() : '';`,
`      let name = descIdx !== -1 ? String(row[descIdx]).trim() : '';
      const category = catIdx !== -1 ? String(row[catIdx]).trim() : '';
      const gender = genIdx !== -1 ? String(row[genIdx]).trim() : '';
      const line = lineIdx !== -1 ? String(row[lineIdx]).trim() : '';
      const driver = driverIdx !== -1 ? String(row[driverIdx]).trim() : '';
      const colorDesc = colorDescIdx !== -1 ? String(row[colorDescIdx]).trim() : '';
      if (colorDesc) name += \` - \${colorDesc}\`;
      if (!name && modelo) name = modelo;
      if (!name) name = \`Product \${id}\`;`
);

fs.writeFileSync('update-firebase.ts', code);
