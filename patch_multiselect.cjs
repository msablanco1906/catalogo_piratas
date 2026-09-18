const fs = require('fs');
let code = fs.readFileSync('src/components/MultiSelectFilter.tsx', 'utf8');

// Replace truncate with something that allows wrapping
code = code.replace(/<span className="truncate pr-4 font-semibold text-slate-700">/g, '<span className="pr-4 font-semibold text-slate-700 break-words text-left">');
code = code.replace(/<span className="truncate font-bold text-slate-800">/g, '<span className="font-bold text-slate-800 break-words text-left">');
code = code.replace(/<span className="truncate">/g, '<span className="break-words text-left">');

fs.writeFileSync('src/components/MultiSelectFilter.tsx', code);
