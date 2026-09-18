const fs = require('fs');
let code = fs.readFileSync('src/components/CartView.tsx', 'utf8');
code = "import { useState } from 'react';\n" + code;
fs.writeFileSync('src/components/CartView.tsx', code);
