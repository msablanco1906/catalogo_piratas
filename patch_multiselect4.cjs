const fs = require('fs');
let code = fs.readFileSync('src/components/MultiSelectFilter.tsx', 'utf8');

code = code.replace(/<span className="pr-4 font-semibold text-slate-700 break-words text-left">/g, '<span className="pr-4 font-semibold text-slate-700 whitespace-normal break-words text-left flex-1">');

fs.writeFileSync('src/components/MultiSelectFilter.tsx', code);
