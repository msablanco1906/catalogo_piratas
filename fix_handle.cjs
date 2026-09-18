const fs = require('fs');
let code = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');

code = code.replace(/const isFilaActive[\s\S]*?handleBrandClick\('FILA'\)[\s\S]*?aria-label="Filtrar por Umbro"[\s\S]*?<\/button>/, `<h1 className="text-lg font-black tracking-tighter uppercase leading-none">Filtros</h1>`);
// Note: It's hard to target the giant brand block, I'll just rewrite the file fully.
fs.writeFileSync('src/components/MobileFilterDrawer.tsx', `import { X, RotateCcw, RefreshCw } from 'lucide-react';
import { MultiSelectFilter } from './MultiSelectFilter';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  filterSeccion: string[];
  setFilterSeccion: (v: string[]) => void;
  filterStatus: 'LINEA' | 'OFF' | 'ALL';
  setFilterStatus: (v: 'LINEA' | 'OFF' | 'ALL') => void;
  isAdmin: boolean;
  imageFilter: 'all' | 'with_images' | 'without_images';
  setImageFilter: (v: 'all' | 'with_images' | 'without_images') => void;
  onClearFilters: () => void;
  totalResults: number;
  onSyncFromSheets: () => void;
}

export function MobileFilterDrawer({
  isOpen, onClose, categories, filterSeccion, setFilterSeccion,
  filterStatus, setFilterStatus, isAdmin, imageFilter, setImageFilter,
  onClearFilters, totalResults, onSyncFromSheets
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose} 
      />
      <div className="relative w-full max-w-sm bg-white text-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Filtros</h1>
            <span className="text-[10px] font-bold bg-[#00205b]/10 text-[#00205b] px-2 py-0.5 rounded-full border border-[#00205b]/20 ml-1">
              {totalResults} items
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearFilters}
              className="text-xs text-[#e21836] hover:text-[#b31027] font-bold flex items-center gap-1 p-1.5 rounded-md hover:bg-rose-50 transition-colors uppercase tracking-wider cursor-pointer"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-white">
          <MultiSelectFilter
            label="Sección"
            options={categories}
            selectedValues={filterSeccion}
            onChange={setFilterSeccion}
            placeholder="Todas las secciones"
          />

          {isAdmin && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                Filtro de Fotos (Solo Administrador)
              </label>
              <select
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value as 'all' | 'with_images' | 'without_images')}
                className="w-full bg-[#f7f8fa] border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#00205b]/30"
              >
                <option value="all">Todas (con y sin fotos)</option>
                <option value="with_images">Solo con fotos</option>
                <option value="without_images">Solo sin fotos</option>
              </select>
              {onSyncFromSheets && (
                <button
                  onClick={onSyncFromSheets}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs bg-[#00205b] hover:bg-[#001740] text-white font-black py-2.5 px-3 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sincronizar Stock Sheet
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0 shadow-lg">
          <button
            onClick={onClose}
            className="w-full bg-[#00205b] hover:bg-[#001740] text-white font-black py-3 px-4 rounded-xl shadow-md shadow-[#00205b]/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            Ver {totalResults} {totalResults === 1 ? 'SKU' : 'SKUs'}
          </button>
        </div>
      </div>
    </div>
  );
}
`);
