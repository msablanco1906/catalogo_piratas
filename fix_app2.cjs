const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace both occurrences correctly
// First occurrence is at line 296, we want it to be just `return () => unsubscribe();`
// Second occurrence is at line 454, we want it to be the block.

code = code.replace(/return \(\) => \{\n      unsubscribe\(\);\n      document\.removeEventListener\('visibilitychange', handleVisibilityChange\);\n    \};/, 'return () => unsubscribe();');

code = code.replace(/return \(\) => unsubscribe\(\);\n  \}, \[user\]\);/, `return () => {\n      unsubscribe();\n      document.removeEventListener('visibilitychange', handleVisibilityChange);\n    };\n  }, [user]);`);

fs.writeFileSync('src/App.tsx', code);
