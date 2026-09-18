const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The section header still shows 'marca' and 'division', but now they are mostly empty.
code = code.replace(/<span className={`text-\[9px\] font-black uppercase px-2 py-0\.5 rounded-md shadow-2xs \$\{[\s\S]*?\}<\/span>/, '');
code = code.replace(/<span className="text-\[9px\] font-extrabold uppercase px-1\.5 py-0\.5 rounded-md bg-slate-200 text-slate-800">\s*\{section.division\}\s*<\/span>/, '');

fs.writeFileSync('src/App.tsx', code);
