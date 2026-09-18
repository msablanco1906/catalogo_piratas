import { useState } from 'react';
import { Product } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatProductName, formatPublicPrice, formatPrice } from '../lib/formatters';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[currentImageIdx] : product.coverImage;
  const isOff = product.status === 'OFF' || (product.discount && product.discount !== '0' && product.discount !== '0%');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row z-10 border border-slate-200">
        
        {/* Left: Product Image Showcase */}
        <div className="w-full md:w-1/2 bg-[#f7f8fa] relative min-h-[300px] md:min-h-[480px] flex flex-col justify-center items-center p-6 border-b md:border-b-0 md:border-r border-slate-200">
          {currentImage ? (
            <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden min-h-[260px]">
              <ImageWithFallback 
                src={currentImage} 
                alt={`${product.name} - foto ${currentImageIdx + 1}`} 
                className="max-h-[360px] w-auto max-w-full object-contain mix-blend-multiply transition-all duration-300"
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/95 shadow-lg hover:bg-white p-2 sm:p-2.5 rounded-full text-slate-800 transition-all active:scale-95 cursor-pointer"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/95 shadow-lg hover:bg-white p-2 sm:p-2.5 rounded-full text-slate-800 transition-all active:scale-95 cursor-pointer"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold text-sm uppercase tracking-wider">
              Sin imagen disponible
            </div>
          )}
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="w-full pt-3 flex items-center justify-center gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 bg-white p-1 transition-all cursor-pointer ${
                    idx === currentImageIdx ? 'border-[#00205b] ring-2 ring-[#00205b]/20' : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Information */}
        <div className="w-full md:w-1/2 bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            {/* Header with Badges and Close button */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {product.marca && (
                  <span className="px-2.5 py-1 bg-[#00205b] text-white rounded-md text-[11px] font-black uppercase tracking-wider">
                    {product.marca}
                  </span>
                )}
                {product.gender && (
                  <span className="px-2.5 py-1 bg-[#00205b]/10 text-[#00205b] rounded-md text-[11px] font-black uppercase tracking-wider">
                    {product.gender}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Title (1st Line) */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-1.5 uppercase tracking-tight">
              {formatProductName(product.name, product.colorDesc)}
            </h2>

            {/* SKU (2nd Line) */}
            {product.sku && (
              <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-1">
                SKU: <span className="font-black text-slate-900">{product.sku}</span>
              </p>
            )}

            {/* Color Description */}
            {product.colorDesc && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {product.colorDesc}
              </p>
            )}

            {/* Category / Gender / Line breadcrumbs */}
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
              {[product.category, product.gender, product.line, product.driver].filter(Boolean).join(' • ')}
            </div>

            {/* Prices Box - ONLY PUBLIC PRICE */}
            <div className="bg-[#f7f8fa] rounded-xl border border-slate-200 p-5 shadow-xs">
              {isOff ? (
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Original public price with strikethrough */}
                  {product.pricePublic !== undefined && product.pricePublic > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                        PRECIO PÚBLICO ANTERIOR
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-slate-400 line-through">
                        ${formatPublicPrice(product.pricePublic)}
                      </div>
                    </div>
                  )}

                  {/* Right: Discounted Public Price */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-[#e21836] uppercase tracking-wider font-bold">
                        PRECIO PÚBLICO OFF
                      </span>
                      {product.discount && product.discount !== '0' && product.discount !== '0%' && (
                        <span className="bg-[#e21836] text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">
                          {product.discount.includes('%') ? product.discount : `${product.discount}%`}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#e21836] leading-tight">
                      ${formatPublicPrice(product.pricePublicDiscounted || product.pricePublic || 0)}
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular / Line public price */
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                    PRECIO PÚBLICO
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#00205b]">
                    ${product.pricePublic !== undefined && product.pricePublic > 0 ? formatPublicPrice(product.pricePublic) : formatPrice(product.price)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
