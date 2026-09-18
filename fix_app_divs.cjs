const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Looking at 642 onwards, it seems missing a container or something
code = code.replace(/<\/header>\n\n\n                  \{error && \(/, 
`</header>
<div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                  {error && (`);

// There was also a div closed in the syntax logic replaced earlier
// Let's replace the whole main container logic to be safe
code = code.replace(/<div className="w-full bg-\[#f7f8fa\] h-full flex flex-col overflow-hidden relative">[\s\S]*?<\/div>\s*<\/div>\s*\) : \(\s*\/\* ==/g,
`<div className="w-full bg-[#f7f8fa] h-full flex flex-col overflow-hidden relative">
            {/* Mobile Header */}
            <header className="bg-white text-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200 z-30 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5">
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
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {error && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 flex justify-between items-center mb-3 text-xs font-medium">
                  <span>{error}</span>
                  <button onClick={() => window.location.reload()} className="px-2.5 py-1 bg-white rounded-lg border border-rose-200 hover:bg-rose-50">Reintentar</button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">Cargando productos...</div>
              ) : groupedProductSections.length > 0 ? (
                <div className="space-y-6">
                  {groupedProductSections.map(section => (
                    <div key={section.key} className="space-y-2.5">
                      <div className="sticky top-0 z-10 bg-[#f7f8fa]/95 backdrop-blur-xs py-2 px-1 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                            {section.title}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {section.items.length} {section.items.length === 1 ? 'SKU' : 'SKUs'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                        {section.items.map(p => [p]).map(variants => (
                          <div key={variants[0].id}>
                            <ProductCard 
                              product={variants[0]} 
                              variants={variants}
                              isMobileView={true}
                              onClick={setSelectedProduct} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center p-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">No se encontraron productos</h3>
                  <p className="text-xs text-slate-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==`);

fs.writeFileSync('src/App.tsx', code);
