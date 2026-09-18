const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const efficientLogic = `
      // 4. Guardar/Actualizar SÓLO productos modificados
      const docsToUpdate = data.filter(p => {
        const existing = existingProducts.get(p.id);
        if (!existing) return true;
        
        // Custom deep compare function
        const isObjectEqual = (obj1, obj2) => {
            if (obj1 === obj2) return true;
            if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
            
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            
            for (let key of keys1) {
                if (!keys2.includes(key)) return false;
                const val1 = obj1[key];
                const val2 = obj2[key];
                if (typeof val1 === 'object' && typeof val2 === 'object') {
                    if (!isObjectEqual(val1, val2)) return false;
                } else if (val1 !== val2) {
                    return false;
                }
            }
            return true;
        };
        
        const cleanP = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
        return !isObjectEqual(existing, cleanP);
      });

      for (let i = 0; i < docsToUpdate.length; i += CHUNK_SIZE) {
        const chunk = docsToUpdate.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(p => {
          const docRef = doc(collection(db, 'products'), p.id);
          const cleanP = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
          batch.set(docRef, cleanP);
        });
        await batch.commit();
      }
      
      if (!isSilent) alert(\`Stock sincronizado correctamente en Firebase (\${docsToUpdate.length} actualizados, \${docsToDelete.length} eliminados).\`);
`;

code = code.replace(/\/\/ 4\. Guardar\/Actualizar productos en batches de 500[\s\S]*?if \(!isSilent\) alert\(`Stock sincronizado.*?\);\n/m, efficientLogic + '\n');
fs.writeFileSync('src/App.tsx', code);
