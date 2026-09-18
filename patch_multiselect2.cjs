const fs = require('fs');
let code = fs.readFileSync('src/components/MultiSelectFilter.tsx', 'utf8');

code = code.replace(/className="flex items-center px-3 py-2/g, 'className="flex items-start px-3 py-2');
code = code.replace(/className="mr-2\.5 h-3\.5 w-3\.5 rounded border-slate-300 text-\[#00205b\] focus:ring-\[#00205b\] accent-\[#00205b\]"/g, 'className="mr-2.5 mt-[2px] h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#00205b] focus:ring-[#00205b] accent-[#00205b]"');

fs.writeFileSync('src/components/MultiSelectFilter.tsx', code);
