/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, LogOut, Settings, PanelLeftClose, PanelLeftOpen, SlidersHorizontal, X, RotateCcw, Shield, Image as ImageIcon, Check } from 'lucide-react';
import { Product, SheetConfig } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { MultiSelectFilter } from './components/MultiSelectFilter';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { ViewModeSwitch } from './components/ViewModeSwitch';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { UserManagement } from './components/UserManagement';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getProducts } from './lib/sheets';

// HARDCODE YOUR GOOGLE SHEETS CONFIGURATION HERE
const CONFIG: SheetConfig = {
  stockSheetId: '1WSgDPnsjfb0ppkBhyaPqpimO6DN6NZoJhQ2l6tZ9jRk',
  stockSheetTab: 'Hoja 1',
  imageSheetId: '',
  imageSheetTab: '',
};

import { formatProductName } from './lib/formatters';


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(true);

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

  // Grouping Mode: 'line' vs 'capsule'
  const [groupBy, setGroupBy] = useState<'line' | 'capsule'>('line');
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'LINEA' | 'OFF' | 'ALL'>('ALL');
  const [filterMarca, setFilterMarca] = useState<string[]>([]);
    const [filterSeccion, setFilterSeccion] = useState<string[]>([]);
          const [imageFilter, setImageFilter] = useState<'all' | 'with_images' | 'without_images'>('all');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // View mode: PC vs Mobile switch
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>(() => {
    const saved = localStorage.getItem('dass_view_mode');
    if (saved === 'pc' || saved === 'mobile') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'pc';
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (userRole === 'admin') return true;
    const email = user.email?.toLowerCase() || '';
    return email === 'mblanco@grupodass.com.ar';
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

  
      const isAnyBrandFilterActive = filterMarca.length > 0;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterSeccion.length > 0) count += filterSeccion.length;
    if (filterStatus !== 'ALL') count += 1;
    if (search.trim()) count += 1;
    return count;
  }, [filterSeccion, filterStatus, search]);

  useEffect(() => {
    // Auth logic removed
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
    setIsGuest(false);
    localStorage.removeItem('dass_is_guest');
    setCurrentView('shop');
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    localStorage.setItem('dass_is_guest', 'true');
    setShowLoginModal(false);
  };

  const fetchLiveProducts = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError('');
    try {
      // 1. Fetch live from server endpoint with memory caching and rate limit shields
      const url = isManual ? `/api/products?force=true&_=${Date.now()}` : '/api/products';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setLoading(false);
          try {
            localStorage.setItem('dass_catalog_cache', JSON.stringify(data.products));
          } catch {}
          return;
        }
      }
    } catch (e) {
      console.warn('Live /api/products failed, checking client fallback:', e);
    }

    // 2. Client-side fallback fetch directly from Google Sheets if server failed
    try {
      const fetchedProducts = await getProducts(CONFIG.stockSheetId);
      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        setLoading(false);
        try {
          localStorage.setItem('dass_catalog_cache', JSON.stringify(fetchedProducts));
        } catch {}
        return;
      }
    } catch (err: any) {
      console.warn('Client sheets fetch fallback failed:', err);
      // If we already have products from localStorage / previous state, don't show error
      if (products.length === 0 && isManual) {
        setError(err.message || 'Error al conectar con Google Sheets');
      }
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
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
          try {
            localStorage.setItem('dass_catalog_cache', JSON.stringify(data.products));
          } catch {}
        }
        if (!isSilent) {
          if (data.quotaExceeded) {
            alert(`Stock actualizado con éxito en tiempo real.\n\nNota: ${data.message}`);
          } else {
            alert('Stock sincronizado exitosamente.');
          }
        }
      } else {
        throw new Error(data.error || 'Error al sincronizar stock');
      }
    } catch (err: any) {
      console.warn('Backend sync failed, falling back to direct sheets fetch:', err);
      try {
        await fetchLiveProducts(true);
        if (!isSilent) alert('Stock actualizado en tiempo real directamente desde Google Sheets.');
      } catch (fallbackErr: any) {
        if (!isSilent) {
          setError(fallbackErr.message || 'Error al sincronizar con Google Sheets');
        }
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    // If no products cached in localStorage, show loading indicator
    if (products.length === 0) {
      setLoading(true);
    }

    // Fetch latest fresh stock from server (cached in memory or live from Google Sheets)
    fetchLiveProducts(false).catch((err) => {
      console.warn("Live fetch note:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Base products available in catalog with stock > 0 (and image for non-admin guests)
  const baseCatalogProducts = useMemo(() => {
    return products.filter(product => {
      const totalStock = Object.values(product.sizes || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
      if (totalStock <= 0) return false;

      // Guests ONLY see products that have images
      if (!isAdmin) {
        const hasCover = !!product.coverImage && product.coverImage.trim() !== '';
        const hasImages = Array.isArray(product.images) && product.images.length > 0;
        if (!hasCover && !hasImages) return false;
      }

      return true;
    });
  }, [products, isAdmin]);

  // Statuses available
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (p.status === 'LINEA' || p.status === 'OFF') {
        statuses.add(p.status);
      }
    });
    if (statuses.size > 1) {
      return ['ALL', 'LINEA', 'OFF'] as ('ALL' | 'LINEA' | 'OFF')[];
    }
    return Array.from(statuses) as ('LINEA' | 'OFF')[];
  }, [baseCatalogProducts]);

  // Brands present in base catalog
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (p.marca && p.marca.trim() !== '') {
        set.add(p.marca.trim());
      }
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts]);

  // Available Filter Options (Cascading based on current selections)
  const divisions = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      const div = (p.division || p.category || '').trim().toUpperCase();
      if (div) set.add(div);
    });
    
    return Array.from(set).sort((a, b) => {
      const order: Record<string, number> = {
        'CALZADO': 1,
        'INDUMENTARIA': 2,
        'ACCESORIOS': 3
      };
      
      const orderA = order[a] || 99;
      const orderB = order[b] || 99;
      
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const marcas = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.marca) set.add(p.marca);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const genders = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.gender) set.add(p.gender);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const lines = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.line) set.add(p.line);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const drivers = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.driver && p.driver !== '-' && p.driver !== 'N/D') set.add(p.driver);
    });
    return Array.from(set).sort();
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  const discounts = useMemo(() => {
    const set = new Set<string>();
    baseCatalogProducts.forEach(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return;
      if (filterMarca.length > 0 && !filterMarca.includes(p.marca)) return;
      if (0 > 0) {
        const pDiv = (p.division || p.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return;
      }
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (0 > 0 && !false) return;
      if (p.discount && p.discount !== '0' && p.discount !== '0%') {
        set.add(p.discount);
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
      return numA - numB;
    });
  }, [baseCatalogProducts, filterStatus, filterMarca]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    const list = products.filter(product => {
      const totalStock = Object.values(product.sizes || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
      if (totalStock <= 0) return false;

      const hasCover = !!product.coverImage && product.coverImage.trim() !== '';
      const hasImages = Array.isArray(product.images) && product.images.length > 0;
      const hasAnyImage = hasCover || hasImages;

      // Guests ONLY see products with images
      if (!isAdmin && !hasAnyImage) return false;

      // Admin image filter
      if (isAdmin) {
        if (imageFilter === 'with_images' && !hasAnyImage) return false;
        if (imageFilter === 'without_images' && hasAnyImage) return false;
      }

      if (filterStatus !== 'ALL' && product.status !== filterStatus) return false;

      const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        const matchesName = product.name?.toLowerCase() || '';
        const matchesSku = product.sku?.toLowerCase() || '';
        const matchesArt = product.articulo?.toLowerCase() || '';
        const matchesMarca = product.marca?.toLowerCase() || '';
        const matchesColorDesc = product.colorDesc?.toLowerCase() || '';
        const matchesColorCode = product.colorCode?.toLowerCase() || '';
        const matchesCategory = product.category?.toLowerCase() || '';
        const matchesDivision = product.division?.toLowerCase() || '';
        const matchesLine = product.line?.toLowerCase() || '';
        const matchesDriver = product.driver?.toLowerCase() || '';
        const matchesGender = product.gender?.toLowerCase() || '';

        const fullProductText = `${matchesName} ${matchesSku} ${matchesArt} ${matchesMarca} ${matchesColorDesc} ${matchesColorCode} ${matchesCategory} ${matchesDivision} ${matchesLine} ${matchesDriver} ${matchesGender}`;

        const isMatch = searchTerms.every(term => fullProductText.includes(term));
        if (!isMatch) return false;
      }

      if (filterMarca.length > 0 && !filterMarca.includes(product.marca)) return false;
      if (0 > 0) {
        const pDiv = (product.division || product.category || '').trim().toUpperCase();
        if (![].some(d => d.trim().toUpperCase() === pDiv)) return false;
      }
      if (0 > 0 && !false) return false;
      if (0 > 0 && !false) return false;
      if (0 > 0 && !false) return false;
      if (0 > 0 && !false) return false;

      return true;
    });

    return list.sort((a, b) => {
      const catA = (a.category || '').toUpperCase().trim();
      const catB = (b.category || '').toUpperCase().trim();
      if (catA !== catB) return catA.localeCompare(catB);
      
      const nameA = (a.name || '').toUpperCase().trim();
      const nameB = (b.name || '').toUpperCase().trim();
      return nameA.localeCompare(nameB);
    });
  }, [products, search, filterStatus, filterMarca, filterSeccion, imageFilter, isAdmin, groupBy]);

  // Grouped products for clean section titles
  const groupedProductSections = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, p) => {
      const sec = p.category || 'Otras Secciones';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(p);
      return acc;
    }, {} as Record<string, Product[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sectionName, items]) => ({
        key: sectionName,
        title: sectionName,
        marca: '',
        division: '',
        category: sectionName,
        line: '',
        driver: '',
        items: (items as Product[]).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }));
  }, [filteredProducts]);

  // Login view disabled
  // if (authInitialized && !user && !isGuest) {
  //   return <LoginView onGuestAccess={handleGuestAccess} />;
  // }

  return (
    <div className="h-screen w-full bg-[#f7f8fa] font-sans text-slate-900 overflow-hidden flex flex-col">
      {viewMode === 'mobile' ? (
        /* ========================================================================= */
        /* MOBILE VIEW LAYOUT                                                        */
        /* ========================================================================= */
        <div className="flex-1 flex justify-center bg-[#f7f8fa] overflow-hidden w-full">
          <div className="w-full bg-[#f7f8fa] h-full flex flex-col overflow-hidden relative">
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
        /* ========================================================================= */
        /* PC / DESKTOP VIEW LAYOUT                                                  */
        /* ========================================================================= */
        <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
          {/* Sidebar Filters */}
          <aside className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ${isSidebarMinimized ? 'w-20 items-center' : 'w-72'}`}>
            <div className="p-6 border-b border-slate-100 flex flex-col items-center justify-between gap-4 relative w-full bg-white">
              <button 
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className={`text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer ${isSidebarMinimized ? '' : 'absolute top-5 right-5'}`}
                title={isSidebarMinimized ? "Expandir" : "Minimizar"}
              >
                {isSidebarMinimized ? <PanelLeftOpen className="w-5 h-5 text-slate-600" /> : <PanelLeftClose className="w-5 h-5 text-slate-400" />}
              </button>
              
              {!isSidebarMinimized ? (
                <div className="flex flex-col items-start gap-3 w-full pr-8">
                  <div className="py-2 flex items-center justify-start gap-2.5 w-full">
                    
                    
                    
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-[#00205b] uppercase tracking-wider">Catálogo de Productos</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Productos</p>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-col items-center gap-2.5 w-full">
                  
                  
                  
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            {!isSidebarMinimized ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-slate-800 bg-white">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-black text-slate-400">Filtros</span>
                    <span className="text-[10px] font-black bg-[#00205b]/10 text-[#00205b] px-1.5 py-0.5 rounded">
                      {filteredProducts.length}/{baseCatalogProducts.length} SKUs
                    </span>
                  </div>
                  <button 
                    onClick={handleClearAllFilters} 
                    className="text-xs text-[#e21836] hover:text-[#b31027] flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar
                  </button>
                </div>

                {/* Group By Switch in Sidebar */}
                <div className="pb-2 border-b border-slate-100 flex flex-col gap-3">
                  <div>
                    
                  </div>
                  
                  <div className="pt-2">
                    <MultiSelectFilter
                      label="Sección"
                      options={categories}
                      selectedValues={filterSeccion}
                      onChange={setFilterSeccion}
                      placeholder="Todas las secciones"
                    />
                  </div>

                </div>

                

                

                

                

                {isAdmin && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#e21836]" />
                        <span>Fotos (Solo Administrador)</span>
                      </label>
                      <select
                        value={imageFilter}
                        onChange={(e) => setImageFilter(e.target.value as 'all' | 'with_images' | 'without_images')}
                        className="w-full bg-[#f7f8fa] border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#00205b]/30"
                      >
                        <option value="all">Todas (con y sin fotos)</option>
                        <option value="with_images">Solo con fotos</option>
                        <option value="without_images">Solo sin fotos</option>
                      </select>
                    </div>

                    <button
                      onClick={() => syncFromSheetsToFirebase(false)}
                      className="w-full flex items-center justify-center gap-2 text-xs bg-[#00205b] hover:bg-[#001740] text-white font-black py-2.5 px-3 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      Sincronizar Stock Sheet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center py-6 gap-6 text-slate-400">
                <button onClick={() => setIsSidebarMinimized(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer" title="Filtros">
                  <Filter className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                <div className="relative flex-1 min-w-[280px] sm:min-w-[340px] max-w-lg">
                  <Search className="absolute left-3.5 top-2.5 sm:top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU, Nombre, Descripción, Color..."
                    className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-[#f7f8fa] border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#00205b] focus:ring-2 focus:ring-[#00205b]/20 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium shadow-2xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Toggle on Desktop */}
                {availableStatuses.length > 1 && (
                  <div className="flex bg-[#f1f3f6] p-1 rounded-full shrink-0 border border-slate-200">
                    {availableStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 py-1.5 text-xs font-black rounded-full transition-all uppercase tracking-wider cursor-pointer ${
                          filterStatus === st
                            ? 'bg-[#00205b] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st === 'ALL' ? 'TODOS' : st === 'LINEA' ? 'LÍNEA' : 'OFF'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Group By Switch in Desktop Header */}
                

                {/* Total SKUs indicator */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f6] rounded-full text-xs font-black text-[#00205b] uppercase tracking-wider shrink-0 border border-slate-200/60">
                  {false ? (
                    <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Mod' : 'Mods'} • {filteredProducts.length} {filteredProducts.length === 1 ? 'SKU' : 'SKUs'}</span>
                  ) : (
                    <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'SKU' : 'SKUs'}</span>
                  )}
                  {filteredProducts.length !== baseCatalogProducts.length && (
                    <span className="text-[10px] text-slate-400 font-medium">/ {baseCatalogProducts.length}</span>
                  )}
                </div>

                {/* Admin-only "Solo con fotos" Toggle Button */}
                {isAdmin && (
                  <button
                    onClick={() => setImageFilter(imageFilter === 'with_images' ? 'all' : 'with_images')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all uppercase tracking-wider cursor-pointer border ${
                      imageFilter === 'with_images'
                        ? 'bg-[#00205b] text-white border-[#00205b] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Mostrar solo productos con foto (Vista exclusiva de Administrador)"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Con fotos</span>
                    {imageFilter === 'with_images' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Admin-only Refresh Live Google Sheets Button */}
                {isAdmin && (
                  <button
                    onClick={() => fetchLiveProducts(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f1f3f6] hover:bg-slate-200 text-slate-700 hover:text-[#00205b] border border-slate-200 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    title="Leer datos directamente de Google Sheets"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00205b]' : ''}`} />
                    <span className="hidden lg:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                  </button>
                )}

                <ViewModeSwitch
                  viewMode={viewMode}
                  onChange={handleViewModeChange}
                />
              </div>
            </header>

            {currentView === 'admin' && isAdmin ? (
              <UserManagement />
            ) : (
              /* Product Grid Area */
              <div className="flex-1 p-6 bg-[#f7f8fa] overflow-y-auto flex flex-col">
                {error && (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 flex justify-between items-center mb-6 text-sm font-medium">
                    <span>{error}</span>
                    <button onClick={() => window.location.reload()} className="px-4 py-1.5 bg-white rounded-lg border border-rose-200 hover:bg-rose-50 font-bold">Reintentar</button>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-20 text-slate-400 font-bold">Cargando productos...</div>
                ) : groupedProductSections.length > 0 ? (
                  <div className="space-y-8">
                    {groupedProductSections.map(section => (
                      <div key={section.key} className="space-y-3">
                        {/* Desktop Section Header */}
                        <div className="sticky top-0 z-10 bg-[#f7f8fa]/95 backdrop-blur-xs py-2.5 px-1 border-b-2 border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                                {section.title}
                              </h3>
                              <span className="text-xs font-bold text-slate-400">
                                {false ? (
                                  <>({section.items.length} {section.items.length === 1 ? 'Modelo' : 'Modelos'} • {section.items.length} {section.items.length === 1 ? 'SKU' : 'SKUs'})</>
                                ) : (
                                  <>({section.items.length} {section.items.length === 1 ? 'SKU' : 'SKUs'})</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Product Grid for Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6">
                          {section.items.map(p => [p]).map(variants => (
                            <div key={variants[0].id}>
                              <ProductCard 
                                product={variants[0]} 
                                variants={variants}
                                onClick={setSelectedProduct} 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <Filter className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">No se encontraron productos</h3>
                    <p className="text-xs text-slate-500">Intente ajustar los filtros de búsqueda.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Mobile Filter Slide-Over Drawer */}
      
<MobileFilterDrawer 
  isOpen={isMobileFilterOpen}
  onClose={() => setIsMobileFilterOpen(false)}
  categories={categories}
  filterSeccion={filterSeccion}
  setFilterSeccion={setFilterSeccion}
  filterStatus={filterStatus}
  setFilterStatus={setFilterStatus}
  isAdmin={isAdmin}
  imageFilter={imageFilter}
  setImageFilter={setImageFilter}
  onClearFilters={handleClearAllFilters}
  totalResults={filteredProducts.length}
  onSyncFromSheets={() => syncFromSheetsToFirebase(false)}
/>


      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

    </div>
  );
}
