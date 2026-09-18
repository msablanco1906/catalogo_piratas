const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I need to fix the broken button and header block in Mobile
// Find this block:
/*
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="p-2 rounded-xl bg-[#f7f8fa] border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
                  aria-label="Abrir filtros"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Agrupado por: <strong className="text-slate-600">{groupBy === 'capsule' ? 'Cápsula' : 'Línea'}</strong>
                    </span>
                  </div>
*/

// Replace it with a valid closing button and header:
code = code.replace(/<button\s*onClick=\{\(\) => setIsMobileFilterOpen\(true\)\}\s*className="p-2 rounded-xl bg-\[#f7f8fa\] border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"\s*aria-label="Abrir filtros"\s*>\s*<SlidersHorizontal className="w-4 h-4 text-slate-700" \/>[\s\S]*?<\/div>\s*<span className="text-\[10px\] text-slate-400 font-medium">\s*Agrupado por: <strong className="text-slate-600">\{groupBy === 'capsule' \? 'Cápsula' : 'Línea'\}<\/strong>\s*<\/span>\s*<\/div>/, `
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="p-2 rounded-xl bg-[#f7f8fa] border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
                  aria-label="Abrir filtros"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Productos</h1>
                  <span className="text-[10px] text-slate-500 font-medium">Catálogo Oficial</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#f7f8fa] border border-slate-200 px-2.5 py-1 rounded-lg">
                  {filteredProducts.length} <span className="text-slate-400 font-medium">SKUs</span>
                </span>
              </div>
            </header>
`);

fs.writeFileSync('src/App.tsx', code);
