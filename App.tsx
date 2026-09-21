/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal, X, Shield, Image as ImageIcon, Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Product, SheetConfig } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { MultiSelectFilter } from './components/MultiSelectFilter';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { ViewModeSwitch } from './components/ViewModeSwitch';

import { auth } from './lib/firebase';
import { signOut, User } from 'firebase/auth';
import { UserManagement } from './components/UserManagement';
import { getProducts } from './lib/sheets';

// CONFIGURACIÓN DE GOOGLE SHEETS
const CONFIG: SheetConfig = {
  stockSheetId: '1WSgDPnsjfb0ppkBhyaPqpimO6DN6NZoJhQ2l6tZ9jRk',
  stockSheetTab: 'Hoja 1',
  imageSheetId: '',
  imageSheetTab: '',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('dass_catalog_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>('shop');

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'LINEA' | 'OFF' | 'ALL'>('ALL');
  const [filterMarca, setFilterMarca] = useState<string[]>([]);
  const [filterSeccion, setFilterSeccion] = useState<string[]>([]);
  const [imageFilter, setImageFilter] = useState<'all' | 'with_images' | 'without_images'>('all');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Modo de vista: PC vs Móvil
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>(() => {
    const saved = localStorage.getItem('dass_view_mode');
    if (saved === 'pc' || saved === 'mobile') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'pc';
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase() || '';
    return email === 'mblanco@grupodass.com.ar' || userRole === 'admin';
  }, [user, userRole]);

  const handleViewModeChange = (mode: 'pc' | 'mobile') => {
    setViewMode(mode);
    localStorage.setItem('dass_view_mode', mode);
  };

  const handleClearAllFilters = () => {
    setFilterMarca([]);
    setFilterSeccion([]);
    setImageFilter('all');
    setSearch('');
    setFilterStatus('ALL');
  };

  const fetchLiveProducts = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError('');
    try {
      const url = isManual ? `/api/products?force=true&_=${Date.now()}` : '/api/products';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setLoading(false);
          localStorage.setItem('dass_catalog_cache', JSON.stringify(data.products));
          return;
        }
      }
    } catch (e) {
      console.warn('Live /api/products failed:', e);
    }

    try {
      const fetchedProducts = await getProducts(CONFIG.stockSheetId);
      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        setLoading(false);
        localStorage.setItem('dass_catalog_cache', JSON.stringify(fetchedProducts));
      }
    } catch (err: any) {
      if (products.length === 0 && isManual) {
        setError(err.message || 'Error al conectar con Google Sheets');
      }
    } finally {
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const syncFromSheetsToFirebase = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch('/api/sync-stock', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem('dass_catalog_cache', JSON.stringify(data.products));
        }
        if (!isSilent) alert('Stock sincronizado exitosamente.');
      }
    } catch (err) {
      console.warn('Sync failed:', err);
      fetchLiveProducts(true);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length === 0) setLoading(true);
    fetchLiveProducts(false).finally(() => setLoading(false));
  }, []);

  const baseCatalogProducts = useMemo(() => {
    return products.filter(product => {
      const totalStock = Object.values(product.sizes || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
      if (totalStock <= 0) return false;
      if (!isAdmin) {
        const hasAnyImage = !!product.coverImage || (Array.isArray(product.images) && product.images.length > 0);
        if (!hasAnyImage) return false;
      }
      return true;
    });
  }, [products, isAdmin]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const totalStock = Object.values(product.sizes || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
      if (totalStock <= 0) return false;

      const hasAnyImage = !!product.coverImage || (Array.isArray(product.images) && product.images.length > 0);
      if (!isAdmin && !hasAnyImage) return false;

      if (isAdmin) {
        if (imageFilter === 'with_images' && !hasAnyImage) return false;
        if (imageFilter === 'without_images' && hasAnyImage) return false;
      }

      if (filterStatus !== 'ALL' && product.status !== filterStatus) return false;
      if (filterMarca.length > 0 && !filterMarca.includes(product.marca)) return false;
      if (filterSeccion.length > 0 && !filterSeccion.includes(product.category)) return false;

      const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        const fullProductText = `${product.name} ${product.sku} ${product.articulo} ${product.marca} ${product.colorDesc} ${product.category} ${product.division}`.toLowerCase();
        return searchTerms.every(term => fullProductText.includes(term));
      }

      return true;
    }).sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  }, [products, search, filterStatus, filterMarca, filterSeccion, imageFilter, isAdmin]);

  const groupedProductSections = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, p) => {
      const sec = p.category || 'Otras Secciones';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(p);
      return acc;
    }, {} as Record<string, Product[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([title, items]) => ({
      key: title,
      title,
      items: items.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }));
  }, [filteredProducts]);

  return (
    <div className="h-screen w-full bg-[#f7f8fa] font-sans text-slate-900 overflow-hidden flex flex-col">
      {viewMode === 'mobile' ? (
        <div className="flex-1 flex justify-center bg-[#f7f8fa] overflow-hidden w-full">
          <div className="w-full bg-[#f7f8fa] h-full flex flex-col overflow-hidden relative">
            <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-2xs z-30">
              <div className="flex items-center gap-2.5">
                <button onClick={() => setIsMobileFilterOpen(true)} className="p-2 rounded-xl bg-[#f7f8fa] border border-slate-200 text-slate-700">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-lg font-black uppercase leading-none">Productos</h1>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wider">CATÁLOGO OFICIAL</span>
                </div>
              </div>
              <div className="text-xs font-bold bg-[#f7f8fa] px-2.5 py-1 rounded-lg border border-slate-200">
                {filteredProducts.length} SKUs
              </div>
            </header>

            {/* BUSCADOR MÓVIL */}
            <div className="bg-white px-4 py-2.5 border-b border-slate-100 shrink-0 shadow-2xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-9 pr-9 py-2 bg-[#f7f8fa] border border-slate-200 rounded-xl text-sm focus:bg-white outline-none placeholder:text-slate-400 font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-2 text-slate-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {loading ? (
                <div className="text-center py-20 text-slate-400 text-sm font-bold">Cargando productos...</div>
              ) : groupedProductSections.length > 0 ? (
                <div className="space-y-6">
                  {groupedProductSections.map(section => (
                    <div key={section.key} className="space-y-2.5">
                      <div className="sticky top-0 z-10 bg-[#f7f8fa]/95 backdrop-blur-xs py-2 px-1 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">{section.title}</h3>
                        <span className="text-[10px] font-bold text-slate-400">{section.items.length} SKUs</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {section.items.map(p => (
                          <ProductCard key={p.id} product={p} variants={[p]} isMobileView={true} onClick={setSelectedProduct} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center">
                  <Filter className="w-8 h-8 text-slate-300 mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">No se encontraron productos</h3>
                  <button onClick={handleClearAllFilters} className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">Limpiar filtros</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
          <aside className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isSidebarMinimized ? 'w-20' : 'w-72'}`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              {!isSidebarMinimized && <h1 className="text-sm font-black text-[#00205b] uppercase">Catálogo</h1>}
              <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className="p-2 rounded-lg hover:bg-slate-100">
                {isSidebarMinimized ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
            </div>
            {!isSidebarMinimized && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase">Filtros</span>
                  <button onClick={handleClearAllFilters} className="text-xs text-[#e21836] font-bold flex items-center gap-1 uppercase"><RotateCcw className="w-3 h-3" /> Limpiar</button>
                </div>
                <MultiSelectFilter label="Sección" options={categories} selectedValues={filterSeccion} onChange={setFilterSeccion} placeholder="Todas las secciones" />
                {isAdmin && (
                  <div className="pt-4 border-t space-y-3">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Administrador</label>
                    <select value={imageFilter} onChange={e => setImageFilter(e.target.value as any)} className="w-full bg-slate-100 p-2 rounded-lg text-xs outline-none">
                      <option value="all">Todas las fotos</option>
                      <option value="with_images">Solo con fotos</option>
                      <option value="without_images">Solo sin fotos</option>
                    </select>
                    <button onClick={() => syncFromSheetsToFirebase(false)} className="w-full bg-[#00205b] text-white py-2 rounded-lg text-xs font-black uppercase">Sincronizar Stock</button>
                  </div>
                )}
              </div>
            )}
          </aside>
          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:bg-white outline-none transition-all" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                {isAdmin && <button onClick={() => fetchLiveProducts(true)} className="p-2 rounded-xl bg-slate-100"><RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /></button>}
                <ViewModeSwitch viewMode={viewMode} onChange={handleViewModeChange} />
              </div>
            </header>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#f7f8fa]">
              {loading ? (
                <div className="text-center py-20 font-bold text-slate-400">Cargando...</div>
              ) : groupedProductSections.length > 0 ? (
                <div className="space-y-8">
                  {groupedProductSections.map(section => (
                    <div key={section.key} className="space-y-4">
                      <div className="sticky top-0 z-10 bg-[#f7f8fa]/95 py-2 border-b-2 border-slate-200 flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase tracking-tight">{section.title}</h3>
                        <span className="text-xs font-bold text-slate-400">{section.items.length} SKUs</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {section.items.map(p => <ProductCard key={p.id} product={p} variants={[p]} onClick={setSelectedProduct} />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">Sin resultados</div>
              )}
            </div>
          </main>
        </div>
      )}
      <MobileFilterDrawer isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} categories={categories} filterSeccion={filterSeccion} setFilterSeccion={setFilterSeccion} filterStatus={filterStatus} setFilterStatus={setFilterStatus} isAdmin={isAdmin} imageFilter={imageFilter} setImageFilter={setImageFilter} onClearFilters={handleClearAllFilters} totalResults={filteredProducts.length} onSyncFromSheets={() => syncFromSheetsToFirebase(false)} />
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
