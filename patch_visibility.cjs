const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const visibilityLogic = `
    // Sincronización silenciosa en cada carga de página
    syncFromSheetsToFirebase(true).catch(console.error);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromSheetsToFirebase(true).catch(console.error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    setLoading(true);
`;

code = code.replace(/\/\/ Sincronización silenciosa en cada carga de página\n\s*syncFromSheetsToFirebase\(true\)\.catch\(console\.error\);\n\s*setLoading\(true\);/m, visibilityLogic);

// also need to remove event listener on unmount
code = code.replace(/return \(\) => unsubscribe\(\);/m, `return () => {\n      unsubscribe();\n      document.removeEventListener('visibilitychange', handleVisibilityChange);\n    };`);

fs.writeFileSync('src/App.tsx', code);
