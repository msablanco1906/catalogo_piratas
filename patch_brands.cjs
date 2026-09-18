const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace toggleBrandFilter definitions
code = code.replace(/const toggleBrandFilter = [\s\S]*?};\n/g, '');

// Replace isFilaActive and isUmbroActive definitions
code = code.replace(/const isFilaActive = [^\n]*\n/g, '');
code = code.replace(/const isUmbroActive = [^\n]*\n/g, '');

// We'll just remove the whole button blocks for Fila/Umbro in Mobile and Desktop
code = code.replace(/<button[^>]*onClick=\{\(\) => toggleBrandFilter\('FILA'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
code = code.replace(/<button[^>]*onClick=\{\(\) => toggleBrandFilter\('UMBRO'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
code = code.replace(/<span className="w-px h-[57] bg-slate-200"><\/span>/g, '');
code = code.replace(/<span className="w-5 h-px bg-slate-200"><\/span>/g, '');

fs.writeFileSync('src/App.tsx', code);
