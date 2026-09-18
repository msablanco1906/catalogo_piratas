import { useState, useRef, MouseEvent, TouchEvent, SyntheticEvent } from 'react';
import { Product } from '../types';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeImageUrl } from '../lib/imageUtils';
import { formatProductName, formatPublicPrice, formatPrice } from '../lib/formatters';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  variants?: Product[];
  isMobileView?: boolean;
  onClick: (product: Product) => void;
}

export function ProductCard({ product: initialProduct, variants, isMobileView = false, onClick }: ProductCardProps) {
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  // When parent updates the product list/filters, ensure we reflect the current initial product
  // but keep local selected state if it belongs to the same model variant group
  if (initialProduct.id !== selectedProduct.id && (!variants || !variants.find(v => v.id === selectedProduct.id))) {
    setSelectedProduct(initialProduct);
  }

  const product = selectedProduct;
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipedRecentlyRef = useRef<boolean>(false);

  const handleVariantClick = (e: MouseEvent | TouchEvent | SyntheticEvent, variant: Product) => {
    e.stopPropagation();
    setSelectedProduct(variant);
    setCurrentImageIdx(0);
  };
  
  const hasMultipleImages = product.images && product.images.length > 1;

  const nextImage = (e?: MouseEvent | SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!product.images || product.images.length <= 1) return;
    setCurrentImageIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e?: MouseEvent | SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!product.images || product.images.length <= 1) return;
    setCurrentImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!hasMultipleImages) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current || !hasMultipleImages) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Minimum 25px horizontal drag, dominant over vertical scroll, within 800ms
    if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 800) {
      swipedRecentlyRef.current = true;
      setTimeout(() => {
        swipedRecentlyRef.current = false;
      }, 350);

      if (deltaX < 0) {
        // Swiped left -> next photo
        nextImage();
      } else {
        // Swiped right -> prev photo
        prevImage();
      }
    }
    touchStartRef.current = null;
  };

  const handleCardClick = () => {
    if (swipedRecentlyRef.current) return;
    onClick(product);
  };

  const displayImage = product.images && product.images.length > 0 ? product.images[currentImageIdx] : product.coverImage;
  const optimizedDisplayImage = optimizeImageUrl(displayImage);

  // Classification Icon Helper (no background)
  const renderClassificationBadge = () => {
    if (!product.classification) return null;
    
    const classification = product.classification.trim().toLowerCase();
    
    if (classification === 'ganador') {
      return (
        <div className="absolute top-2 right-2 flex items-center justify-center z-10 select-none" title="Ganador">
          <span className="text-xl sm:text-2xl leading-none filter drop-shadow-xs">🔥</span>
        </div>
      );
    }
    
    if (classification === 'volumen') {
      return (
        <div className="absolute top-2 right-2 flex items-center justify-center z-10 select-none" title="Volumen">
          <span className="text-xl sm:text-2xl leading-none filter drop-shadow-xs">📦</span>
        </div>
      );
    }
    
    if (classification === 'descurvado') {
      return (
        <div className="absolute top-2 right-2 flex items-center justify-center z-10 select-none" title="Descurvado">
          <span className="text-xl sm:text-2xl leading-none filter drop-shadow-xs">✂️</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#00205b]/40 transition-all duration-200 cursor-pointer group flex flex-col relative h-full active:scale-[0.99] overflow-hidden p-3.5 sm:p-4 select-none"
    >
      {/* Image Showcase */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`${isMobileView ? 'aspect-[4/3] w-full min-h-[175px]' : 'h-56 sm:h-64 lg:h-72'} bg-[#f7f8fa] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative touch-pan-y`}
      >
        {renderClassificationBadge()}
        
        {(product.discount && product.discount !== '0' && product.discount !== '0%') && (
          <div className={`absolute bottom-2 left-2 bg-[#e21836] text-white ${isMobileView ? 'text-[11px] font-black px-2 py-0.5' : 'text-xs sm:text-xs font-black px-2.5 py-0.5'} rounded-md z-10 shadow-md tracking-wider uppercase pointer-events-none`}>
            {product.discount.includes('%') ? product.discount : `-${product.discount}%`}
          </div>
        )}
        {optimizedDisplayImage ? (
          <>
            <ImageWithFallback 
              src={displayImage}
              alt={product.name}
              className={`w-full h-full object-contain mix-blend-multiply ${isMobileView ? 'scale-120 group-hover:scale-130 p-1.5' : 'scale-110 group-hover:scale-120 p-2'} transition-transform duration-300 pointer-events-none`}
            />
            {hasMultipleImages && (
              <>
                {/* Left navigation arrow button */}
                <button 
                  type="button"
                  onClick={prevImage} 
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 sm:p-2 rounded-full shadow-md backdrop-blur-xs transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 stroke-[2.5]" />
                </button>

                {/* Right navigation arrow button */}
                <button 
                  type="button"
                  onClick={nextImage} 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 sm:p-2 rounded-full shadow-md backdrop-blur-xs transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 stroke-[2.5]" />
                </button>

                {/* Interactive dot indicators & counter badge */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-1.5 right-2 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xs px-2 py-1 rounded-full z-20"
                >
                  <span className="text-[9px] font-bold text-white/90 pr-0.5 pointer-events-none">
                    {currentImageIdx + 1}/{product.images.length}
                  </span>
                  <div className="flex items-center gap-1">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIdx(idx);
                        }}
                        className={`transition-all rounded-full cursor-pointer ${
                          idx === currentImageIdx 
                            ? 'w-2.5 h-1.5 bg-white shadow-xs' 
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                        }`}
                        aria-label={`Ver foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <ImageIcon className="w-12 h-12 text-slate-300 pointer-events-none" />
        )}
      </div>
      
      {/* Variants Thumbnails */}
      {variants && variants.length > 1 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 snap-x">
          {variants.map(variant => (
            <button
              key={variant.id}
              type="button"
              onClick={(e) => handleVariantClick(e, variant)}
              className={`relative shrink-0 snap-start w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#f7f8fa] border-2 transition-all ${
                product.id === variant.id 
                  ? 'border-indigo-600 shadow-sm opacity-100' 
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
              }`}
              title={variant.colorDesc || variant.sku}
            >
              {variant.coverImage ? (
                <ImageWithFallback src={variant.coverImage} alt={variant.colorDesc || ''} className="w-full h-full object-cover mix-blend-multiply p-1" />
              ) : (
                <ImageIcon className="w-4 h-4 text-slate-300 absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Product Content */}
      <div className="flex flex-col flex-grow">
        {/* First Line: Product Name + Gender Tag */}
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <h3 className={`${isMobileView ? 'text-xs font-extrabold text-slate-900 leading-snug line-clamp-2' : 'text-sm font-extrabold text-slate-900 line-clamp-2 leading-tight'} uppercase tracking-tight`}>
            {formatProductName(product.name, product.colorDesc)}
          </h3>
          {product.gender && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00205b] bg-[#00205b]/5 px-1.5 py-0.5 rounded shrink-0">
              {product.gender}
            </span>
          )}
        </div>
        
        {/* Second Line: SKU */}
        {product.sku && (
          <p className={`${isMobileView ? 'text-[11px] font-bold text-slate-600' : 'text-xs font-bold text-slate-600'} uppercase tracking-wider mb-1`}>
            SKU: <span className="font-extrabold text-slate-800">{product.sku}</span>
          </p>
        )}

        {/* Third Line: Color Description */}
        {product.colorDesc && (
          <p className={`${isMobileView ? 'text-[11px] font-medium text-slate-400' : 'text-xs font-medium text-slate-400'} line-clamp-1 mb-2 uppercase`}>
            {product.colorDesc}
          </p>
        )}
        
        <div className="flex flex-col mt-auto gap-1 border-t border-slate-100 pt-2">
          <div className="text-[11px] font-medium text-slate-400 truncate mb-1 uppercase tracking-wider">
            {[product.line, product.driver].filter(Boolean).join(' • ')}
          </div>
          
          <div className="mt-auto">
            {product.status === 'OFF' ? (
              <div className="flex items-end justify-between gap-2">
                {/* Regular Public Price (Strikethrough if discounted) */}
                {product.pricePublic !== undefined && product.pricePublic > 0 && (
                  <div className="text-[10px] sm:text-[11px] leading-tight">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase mr-1">Pub:</span>
                    <span className="font-semibold text-slate-400 line-through">${formatPublicPrice(product.pricePublic)}</span>
                  </div>
                )}
                
                {/* OFF Public Price */}
                {product.pricePublicDiscounted !== undefined && product.pricePublicDiscounted > 0 ? (
                  <div className="text-sm sm:text-base font-black text-[#e21836] leading-tight">
                    <span className="text-[9px] text-[#e21836] font-bold uppercase mr-1">Público:</span>
                    <span>${formatPublicPrice(product.pricePublicDiscounted)}</span>
                  </div>
                ) : (product.pricePublic !== undefined && product.pricePublic > 0) ? (
                  <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Público:</span>
                    <span>${formatPublicPrice(product.pricePublic)}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              /* LINEA / Regular Prices - SOLO PRECIO PÚBLICO */
              <div className="flex flex-col">
                {(product.pricePublic !== undefined && product.pricePublic > 0) ? (
                  <div className="text-sm sm:text-base leading-tight flex items-baseline justify-between">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Público:</span>
                    <span className="font-black text-[#00205b]">${formatPublicPrice(product.pricePublic)}</span>
                  </div>
                ) : (product.price !== undefined && product.price > 0) ? (
                  <div className="text-sm sm:text-base leading-tight flex items-baseline justify-between">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Público:</span>
                    <span className="font-black text-[#00205b]">${formatPrice(product.price)}</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
