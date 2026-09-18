const fs = require('fs');
let code = fs.readFileSync('src/components/MultiSelectFilter.tsx', 'utf8');

// Ensure the spans have flex-1 so they take up remaining space and wrap correctly
code = code.replace(/<span className="font-bold text-slate-800 break-words text-left">/g, '<span className="font-bold text-slate-800 whitespace-normal break-words text-left flex-1">');
code = code.replace(/<span className="break-words text-left">/g, '<span className="whitespace-normal break-words text-left flex-1">');

// Also make the dropdown a bit wider if it helps
code = code.replace(/w-full mt-1\.5 bg-white/, 'w-full min-w-[240px] mt-1.5 bg-white');

fs.writeFileSync('src/components/MultiSelectFilter.tsx', code);
