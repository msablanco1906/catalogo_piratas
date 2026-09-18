const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<span className=\{\`text-\[10px\] font-black uppercase px-2\.5 py-1 rounded-md tracking-wider shadow-2xs \$\{\s*section\.marca\.includes\('FILA'\) \? 'bg-\[#00205b\] text-white' : 'bg-black text-white'\s*\}\`\}>\s*\{section\.marca\}\s*<\/span>\s*<span className="text-\[10px\] font-extrabold uppercase px-2 py-1 rounded-md bg-slate-200 text-slate-800 tracking-wider">\s*\{section\.division\}\s*<\/span>/g;

code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
