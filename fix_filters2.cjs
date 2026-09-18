const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newHeader = `
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Filtros</span>
                <button 
                  onClick={() => {
                    setFilterMarca([]);
                    setFilterCategory([]);
                    setFilterGender([]);
                    setFilterLine([]);
                    setFilterDriver([]);
                    setFilterDiscount([]);
                    setImageFilter('all');
                    setSearch('');
                    setFilterStatus('ALL');
                  }}
                  className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
`;

code = code.replace(/<div className="flex items-center justify-between mb-4">[\s\S]*?Limpiar\n\s*<\/button>\n\s*<\/div>/m, newHeader.trim());

fs.writeFileSync('src/App.tsx', code);
