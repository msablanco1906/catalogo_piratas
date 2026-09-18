const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the onAuthStateChanged effect
code = code.replace(/return \(\) => \{\n      unsubscribe\(\);\n      document\.removeEventListener\('visibilitychange', handleVisibilityChange\);\n    \};/m, 'return () => unsubscribe();');

// Fix the onSnapshot effect (this is the one that needs visibility listener)
code = code.replace(/return \(\) => unsubscribe\(\);/m, `return () => {\n      unsubscribe();\n      document.removeEventListener('visibilitychange', handleVisibilityChange);\n    };`);

fs.writeFileSync('src/App.tsx', code);
