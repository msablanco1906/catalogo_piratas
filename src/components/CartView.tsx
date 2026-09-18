import { useState } from 'react';
import { X, Trash2, ArrowLeft, Download, CheckCircle, AlertCircle, ShoppingBag, Layers } from 'lucide-react';
import { generateExcelFile } from '../utils/excel';
import { CartItem } from '../types';
import { CheckoutView, CheckoutData } from './CheckoutView';
import { sortSizes } from '../lib/utils';
import { optimizeImageUrl } from '../lib/imageUtils';
import { formatProductName, getProductPrices } from '../lib/formatters';
import { ImageWithFallback } from './ImageWithFallback';
import { validateCartBrandDivision, MIN_UNITS_PER_BRAND_DIVISION } from '../lib/cartValidation';

interface CartViewProps {
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem?: (productId: string) => void;
  onClearCart?: () => void;
  onSubmitOrder: (data: CheckoutData) => Promise<void>;
}

export function CartView({ cart, onClose, onRemoveItem, onClearCart, onSubmitOrder }: CartViewProps) {
  const [isCheckout, setIsCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validation = validateCartBrandDivision(cart);
  const { totalUnits, groups, allGroupsValid, invalidGroups, validGroups } = validation;

  const total = cart.reduce((sum, item) => {
    const qty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
    const { priceConfidential } = getProductPrices(item.product);
    return sum + (qty * priceConfidential);
  }, 0);

  const brandsInCart: string[] = Array.from(
    new Set<string>(
      cart
        .filter(item => Object.values(item.quantities).some(q => Number(q) > 0))
        .map(item => (item.product.marca || 'General').trim())
    )
  ).sort();

  const handleDownloadExcel = async (specificBrand?: string) => {
    const rows: any[] = [];
    const itemsToExport = specificBrand 
      ? cart.filter(item => (item.product.marca || 'General').trim().toUpperCase() === specificBrand.toUpperCase())
      : cart;
    
    itemsToExport.forEach(item => {
      const { pricePublic, priceConfidential } = getProductPrices(item.product);

      Object.entries(item.quantities)
        .sort((a, b) => sortSizes(a[0], b[0], item.product.category))
        .forEach(([size, qty]) => {
        if (qty > 0) {
          rows.push({
            imageUrl: item.product.coverImage,
            'Sku': item.product.sku,
            'Modelo': item.product.modelo,
            'Marca': item.product.marca,
            'Articulo': item.product.articulo,
            'Descripcion': formatProductName(item.product.name, item.product.colorDesc),
            'Codigo Color': item.product.colorCode || '',
            'Descripcion Color': item.product.colorDesc || '',
            'Division': item.product.category,
            'Genero': item.product.gender,
            'Disciplina': item.product.line,
            'Driver': item.product.driver,
            'Situacion': item.product.status || '',
            'Descuento': item.product.discount || '0%',
            'Talle': size,
            'Cantidad': qty,
            'Pcio Publico': pricePublic,
            'Pcio Confidencial': priceConfidential,
            'Subtotal': qty * priceConfidential
          });
        }
      });
    });

    const workbook = await generateExcelFile(rows, 'download');
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Download using blob
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = specificBrand ? `Pedido_${specificBrand}.xlsx` : 'Detalle_Pedido.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-serif mb-2">¡Pedido Enviado!</h2>
          <p className="text-slate-600 text-sm mb-6">
            Tu pedido ha sido procesado con éxito. Se enviaron los archivos correspondientes por correo a cada vendedor asignado y a tu casilla.
          </p>

          <div className="flex flex-col gap-2.5 mb-6">
            {brandsInCart.length > 1 ? (
              <>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left mb-1">
                  Descargar planillas por marca:
                </p>
                {brandsInCart.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleDownloadExcel(brand)}
                    className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-600" />
                      Descargar Pedido {brand}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">.xlsx</span>
                  </button>
                ))}
                <button
                  onClick={() => handleDownloadExcel()}
                  className="w-full bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm mt-1"
                >
                  <Download className="w-4 h-4" />
                  Descargar Pedido Completo
                </button>
              </>
            ) : (
              <button
                onClick={() => handleDownloadExcel(brandsInCart[0])}
                className="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar Excel {brandsInCart[0] ? `(${brandsInCart[0]})` : ''}
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (onClearCart) onClearCart();
              onClose();
            }}
            className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <CheckoutView 
        cart={cart}
        onBack={() => setIsCheckout(false)}
        onSubmit={async (data) => {
          await onSubmitOrder(data);
          setShowSuccess(true);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la tienda
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Mi Pedido</h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-slate-500 mb-6">Aún no has agregado ningún producto a tu pedido.</p>
            <button 
              onClick={onClose}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {!allGroupsValid ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-base">Pedido Mínimo: 12 unidades por Marca y División</h3>
                    <p className="text-sm text-amber-800 mt-0.5">
                      Debes alcanzar un mínimo de <strong className="font-bold">12 unidades</strong> en cada combinación de Marca y División que agregues a tu pedido.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/70">
                  {groups.map(group => (
                    <div 
                      key={group.key} 
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        group.isValid 
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                          : 'bg-white border-amber-300 text-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Layers className={`w-4 h-4 shrink-0 ${group.isValid ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span className="font-bold text-xs truncate">
                            {group.marca} <span className="text-slate-400 font-normal">•</span> {group.division}
                          </span>
                        </div>
                        {group.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle className="w-3 h-3" /> {group.units} un. (OK)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            Faltan {group.missingUnits} {group.missingUnits === 1 ? 'un.' : 'un.'}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                          <span>{group.units} de 12 un.</span>
                          <span>{group.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              group.isValid ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${group.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 text-base">¡Mínimos Cumplidos!</h3>
                    <p className="text-sm text-emerald-800 mt-0.5">
                      Cumples con el mínimo de 12 unidades en todas las marcas y divisiones seleccionadas ({totalUnits} unidades totales). Puedes continuar a cargar tus datos.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {groups.map(group => (
                        <span key={group.key} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 px-2.5 py-1 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {group.marca} • {group.division}: <strong className="font-bold">{group.units} un.</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, idx) => {
                  const totalQty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
                  const { priceConfidential: itemPrice } = getProductPrices(item.product);
                  const subtotal = totalQty * itemPrice;

                  return (
                    <div key={`${item.product.id}-${idx}`} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 relative">
                      {onRemoveItem && (
                        <button 
                          onClick={() => onRemoveItem(item.product.id)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-2"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {item.product.coverImage ? (
                          <ImageWithFallback 
                            src={item.product.coverImage} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-2 pr-8">
                          <h3 className="font-bold text-slate-800 line-clamp-1">{formatProductName(item.product.name, item.product.colorDesc)}</h3>
                          {item.product.colorDesc && (
                            <p className="text-sm font-medium text-slate-600 line-clamp-1">{item.product.colorDesc}</p>
                          )}
                          <p className="text-sm text-slate-500">Art: {item.product.articulo} | Marca: <strong className="text-slate-700 font-semibold">{item.product.marca}</strong> | Div: <strong className="text-slate-700 font-semibold">{item.product.category}</strong></p>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg p-3 mb-4">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Talles Pedidos</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.quantities)
                              .filter(([_, qty]) => qty > 0)
                              .sort((a, b) => sortSizes(a[0], b[0], item.product.category))
                              .map(([size, qty]) => (
                              <div key={size} className="bg-white border border-slate-200 rounded px-2 py-1 text-xs flex items-center gap-2 shadow-sm">
                                <span className="font-bold text-slate-700">{size}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-indigo-600 font-bold">{qty} un.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                              Precio Confidencial
                              {(item.product.discount && item.product.discount !== '0' && item.product.discount !== '0%') && (
                                <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  {item.product.discount.includes('%') ? item.product.discount : `-${item.product.discount}%`}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-slate-700">
                              ${itemPrice.toLocaleString('es-AR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Subtotal ({totalQty} un.)</div>
                            <div className="text-lg font-black text-indigo-600">
                              ${subtotal.toLocaleString('es-AR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
                  <h2 className="font-bold text-lg text-slate-800 mb-4">Resumen del Pedido</h2>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Total unidades</span>
                      <span className="font-bold text-slate-800">
                        {totalUnits} un.
                      </span>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mínimo 12 un. x Marca y División:</p>
                      <div className="space-y-1.5">
                        {groups.map(g => (
                          <div key={g.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                            <span className="truncate max-w-[170px] text-slate-700">
                              {g.marca} • {g.division}
                            </span>
                            <span className={`font-bold shrink-0 ${g.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {g.units}/12 un. {g.isValid ? '✓' : `(faltan ${g.missingUnits})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-6">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-black text-indigo-600">${total.toLocaleString('es-AR')}</span>
                  </div>
                  
                  <button 
                    disabled={!allGroupsValid}
                    onClick={() => {
                      if (!allGroupsValid) return;
                      setIsCheckout(true);
                    }}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-3 ${
                      allGroupsValid 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                    }`}
                  >
                    FINALIZAR PEDIDO
                  </button>

                  {!allGroupsValid && invalidGroups.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mb-3">
                      <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                        Debes sumar al menos 12 unidades por Marca y División. Te falta completar:
                      </p>
                      <ul className="text-[11px] text-amber-800 mt-1 list-disc list-inside space-y-0.5 font-medium">
                        {invalidGroups.map(ig => (
                          <li key={ig.key}>
                            <strong>{ig.marca} ({ig.division})</strong>: faltan {ig.missingUnits} {ig.missingUnits === 1 ? 'unidad' : 'unidades'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleDownloadExcel}
                    className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5 text-slate-400" />
                    Descargar Detalle (Excel)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
