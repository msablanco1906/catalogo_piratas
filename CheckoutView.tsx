import React, { useState, useMemo } from 'react';
import { ArrowLeft, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { CartItem } from '../types';
import { formatProductName, getProductPrices } from '../lib/formatters';
import { validateCartBrandDivision, MIN_UNITS_PER_BRAND_DIVISION } from '../lib/cartValidation';

export interface CheckoutData {
  cuit: string;
  razonSocial: string;
  direccion: string;
  solicitante: string;
  emailContacto: string;
  telefono: string;
  emailVendedor: string;
  vendedoresPorMarca: Record<string, string>;
  observaciones?: string;
}

export const VENDEDORES_LIST = [
  { name: 'Camila de Almeida', email: 'cdealmeida@grupodass.com.ar' },
  { name: 'German Menichelli', email: 'gmenichelli@grupodass.com.ar' },
  { name: 'Gustavo Fernandez', email: 'gfernandez@grupodass.com.ar' },
  { name: 'Ignacio Manzoni', email: 'imanzoni@grupodass.com.ar' },
  { name: 'Juan Cassina', email: 'jcassina@grupodass.com.ar' },
  { name: 'Lorena Carrillo', email: 'lcarrillo@grupodass.com.ar' },
  { name: 'Marcelo Dornheim', email: 'mdornheim@grupodass.com.ar' },
  { name: 'Nicolas Martinez', email: 'nmartinez@grupodass.com.ar' },
  { name: 'Pablo Galassi', email: 'pgalassi@grupodass.com.ar' },
  { name: 'Sergio Pons', email: 'spons@grupodass.com.ar' },
  { name: 'Maxi Blanco', email: 'mblanco@grupodass.com.ar' },
];

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onSubmit: (data: CheckoutData) => Promise<void>;
}

export function CheckoutView({ cart, onBack, onSubmit }: CheckoutViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute distinct brands with selected quantities in cart
  const brandsInCart = useMemo(() => {
    const brandSet = new Set<string>();
    cart.forEach(item => {
      const qty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
      if (qty > 0) {
        const brand = (item.product.marca || 'General').trim();
        brandSet.add(brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [cart]);

  const validation = validateCartBrandDivision(cart);
  const { totalUnits, allGroupsValid, invalidGroups } = validation;

  const total = cart.reduce((sum, item) => {
    const qty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
    const { priceConfidential } = getProductPrices(item.product);
    return sum + (qty * priceConfidential);
  }, 0);

  if (!allGroupsValid) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Mínimo no alcanzado</h3>
          <p className="text-slate-600 text-sm mb-4">
            Se requiere un pedido mínimo de <strong>12 unidades por Marca y División</strong> para avanzar.
          </p>

          {invalidGroups.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6 text-left">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">Marcas y Divisiones pendientes:</p>
              <ul className="space-y-1.5 text-xs text-amber-800">
                {invalidGroups.map(g => (
                  <li key={g.key} className="flex items-center justify-between">
                    <span className="font-semibold">{g.marca} • {g.division}:</span>
                    <span>{g.units} de 12 un. (faltan {g.missingUnits} {g.missingUnits === 1 ? 'un.' : 'un.'})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={onBack}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const cuitPart1 = formData.get('cuitPart1') as string;
    const cuitPart2 = formData.get('cuitPart2') as string;
    const cuitPart3 = formData.get('cuitPart3') as string;

    const vendedoresPorMarca: Record<string, string> = {};
    brandsInCart.forEach(brand => {
      const seller = formData.get(`vendedor_${brand}`) as string;
      if (seller) {
        vendedoresPorMarca[brand] = seller;
      }
    });

    const emailVendedorList = Object.values(vendedoresPorMarca).filter(Boolean);
    const primarySeller = emailVendedorList[0] || (formData.get('emailVendedor') as string) || '';

    const data: CheckoutData = {
      cuit: `${cuitPart1}-${cuitPart2}-${cuitPart3}`,
      razonSocial: formData.get('razonSocial') as string,
      direccion: formData.get('direccion') as string,
      solicitante: formData.get('solicitante') as string,
      emailContacto: formData.get('emailContacto') as string,
      telefono: formData.get('telefono') as string,
      emailVendedor: primarySeller,
      vendedoresPorMarca,
      observaciones: (formData.get('observaciones') as string) || undefined,
    };

    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pedido.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-serif">Datos para el Pedido</h1>
          <p className="text-slate-500 mt-2">Completa la información para finalizar tu solicitud.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">CUIT / CUIL *</label>
                  <div className="flex gap-2">
                    <input type="text" name="cuitPart1" placeholder="XX" className="w-16 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center" required maxLength={2} disabled={isSubmitting} />
                    <span className="flex items-center text-slate-400">-</span>
                    <input type="text" name="cuitPart2" placeholder="XXXXXXXX" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center" required maxLength={8} disabled={isSubmitting} />
                    <span className="flex items-center text-slate-400">-</span>
                    <input type="text" name="cuitPart3" placeholder="X" className="w-12 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center" required maxLength={1} disabled={isSubmitting} />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Razón Social *</label>
                  <input type="text" name="razonSocial" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required disabled={isSubmitting} />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dirección de Entrega *</label>
                  <input type="text" name="direccion" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required disabled={isSubmitting} />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Solicitante *</label>
                  <input type="text" name="solicitante" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required disabled={isSubmitting} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email de Contacto *</label>
                  <input type="email" name="emailContacto" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required disabled={isSubmitting} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono de Contacto *</label>
                  <input type="tel" name="telefono" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required disabled={isSubmitting} />
                </div>

                {/* Dynamic Seller Select per Brand in Cart */}
                <div className="md:col-span-4">
                  {brandsInCart.length <= 1 ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Vendedor {brandsInCart[0] ? `${brandsInCart[0]}` : ''} *
                      </label>
                      <select 
                        name={`vendedor_${brandsInCart[0] || 'General'}`} 
                        required 
                        defaultValue=""
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white" 
                        disabled={isSubmitting}
                      >
                        <option value="" disabled>Seleccione un vendedor...</option>
                        {VENDEDORES_LIST.map((v) => (
                          <option key={v.email} value={v.email}>
                            {v.name} ({v.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 md:p-5 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 border-b border-indigo-100 pb-2.5">
                        <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            Asignación de Vendedores por Marca ({brandsInCart.length} marcas en el pedido)
                          </h4>
                          <p className="text-xs text-slate-500">
                            Tu carrito contiene productos de múltiples marcas. Asigna el vendedor correspondiente a cada una:
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {brandsInCart.map((brand) => (
                          <div key={brand} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-indigo-800">
                              Vendedor {brand} <span className="text-red-500">*</span>
                            </label>
                            <select
                              name={`vendedor_${brand}`}
                              required
                              defaultValue=""
                              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-xs font-medium bg-slate-50/50"
                              disabled={isSubmitting}
                            >
                              <option value="" disabled>Seleccione vendedor para {brand}...</option>
                              {VENDEDORES_LIST.map((v) => (
                                <option key={v.email} value={v.email}>
                                  {v.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones (Opcional)</label>
                  <textarea name="observaciones" rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none" disabled={isSubmitting}></textarea>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                >
                  Volver al Carrito
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex-1 shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>

            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="font-bold text-xl text-slate-800 mb-6 font-serif border-b border-slate-200 pb-4">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item, idx) => {
                  const qty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
                  const { priceConfidential: price } = getProductPrices(item.product);
                  return (
                    <div key={idx} className="text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-700 pr-4">{formatProductName(item.product.name, item.product.colorDesc)}</span>
                        <span className="text-slate-600 font-medium whitespace-nowrap">${(price * qty).toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-slate-500 text-xs uppercase tracking-wide">
                        {item.product.marca && <span className="font-bold text-indigo-600 mr-1">{item.product.marca} •</span>}
                        {item.product.category} {item.product.gender}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        {qty} curva(s) x 1u.
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-6 border-t border-slate-200 border-dashed">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-slate-800">Total:</span>
                  <span className="text-2xl font-black text-slate-900">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
