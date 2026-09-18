const fs = require('fs');
let syncCode = fs.readFileSync('src/server/syncService.ts', 'utf8');

syncCode = syncCode.replace(/const descIdx = headers\.findIndex[^;]+;/g, "const descIdx = headers.findIndex(h => h.includes('descripción') || h.includes('descripcion'));");
syncCode = syncCode.replace(/const urlIdx = headers\.findIndex[^;]+;/g, "const urlIdx = headers.findIndex(h => h.includes('url imagen'));\n  const seccionIdx = headers.findIndex(h => h.includes('seccion') || h.includes('sección'));");

// Replace inside productMap initialization
syncCode = syncCode.replace(/const desc = descIdx[\s\S]*?const precio =/g, `const desc = descIdx !== -1 ? row[descIdx]?.trim() : '';
    const seccion = seccionIdx !== -1 ? row[seccionIdx]?.trim() : '';
    const urlImagen = urlIdx !== -1 ? row[urlIdx]?.trim() : '';
    const precioRaw = precioIdx !== -1 ? row[precioIdx]?.trim() : '';
    const vistaRaw = vistaIdx !== -1 ? row[vistaIdx]?.trim() : '0';

    const precio =`);

syncCode = syncCode.replace(/category: '',/g, "category: seccion,");

fs.writeFileSync('src/server/syncService.ts', syncCode);
