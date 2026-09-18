const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change 1: Only admin can run syncFromSheetsToFirebase
code = code.replace(
  /const syncFromSheetsToFirebase = async \(isSilent = false\) => \{/,
  `const syncFromSheetsToFirebase = async (isSilent = false) => {\n    if (userRole !== 'admin') {\n      if (!isSilent) alert('Solo los administradores pueden sincronizar el stock manualmente.');\n      return;\n    }`
);

// We need to remove the old admin check that was just inside
code = code.replace(
  /if \(!isSilent && userRole !== 'admin'\) \{\s*alert\('Solo los administradores pueden sincronizar el stock manualmente.'\);\s*return;\s*\}/,
  ''
);

// Change 2: Only write CHANGED products
const newUpdateLogic = `
      // 1. Consultar los productos actuales en Firestore
      const existingSnap = await getDocs(collection(db, 'products'));
      const existingProducts = new Map();
      existingSnap.forEach(docSnap => {
        existingProducts.set(docSnap.id, docSnap.data());
      });
      const newProductIds = new Set(data.map(p => p.id));
      
      // 2. Identificar productos viejos/obsoletos que ya no están en la planilla
      const docsToDelete = [];
      existingSnap.forEach(docSnap => {
        if (!newProductIds.has(docSnap.id)) {
          docsToDelete.push(docSnap.id);
        }
      });

      // 3. Eliminar productos obsoletos en batches de 500
      const CHUNK_SIZE = 500;
      for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
        const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(id => {
          batch.delete(doc(db, 'products', id));
        });
        await batch.commit();
      }

      // 4. Guardar/Actualizar SÓLO productos modificados en batches de 500
      const docsToUpdate = data.filter(p => {
        const existing = existingProducts.get(p.id);
        if (!existing) return true;
        return JSON.stringify(existing) !== JSON.stringify(Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined)));
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

code = code.replace(
  /\/\/ 1\. Consultar los productos actuales[\s\S]*?if \(!isSilent\) alert\(`Stock sincronizado correctamente en Firebase.*?\);\n/m,
  newUpdateLogic + '\n'
);

fs.writeFileSync('src/App.tsx', code);
