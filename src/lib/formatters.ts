import { Product } from '../types';

export function formatProductName(name: string | undefined, colorDesc: string | undefined): string {
  if (!name) return '';
  if (!colorDesc) return name.trim();
  
  const cleanName = name.trim();
  const cleanColor = colorDesc.trim();
  if (!cleanColor) return cleanName;

  // Replace case-insensitive " - COLOR", "- COLOR", "-COLOR" at the end of the string
  const regex = new RegExp(`[\\s]*-?[\\s]*${cleanColor.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\$&')}$`, 'i');
  return cleanName.replace(regex, '').trim();
}

export function formatConfidentialPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return '0,00';
  return Math.round(price).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function formatPublicPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return '0,00';
  return Math.round(price).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return '0,00';
  return Math.round(price).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function parseSheetPrice(val: string | number | undefined | null): number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  const str = String(val).trim();
  if (!str) return undefined;

  let cleanStr = str.replace(/[^0-9.,-]/g, '');
  if (!cleanStr) return undefined;

  const hasComma = cleanStr.includes(',');
  const hasDot = cleanStr.includes('.');

  if (hasComma && hasDot) {
    const lastComma = cleanStr.lastIndexOf(',');
    const lastDot = cleanStr.lastIndexOf('.');
    if (lastComma > lastDot) {
      // 1.234,56
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56
      cleanStr = cleanStr.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = cleanStr.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      // 53,900 -> 53900
      cleanStr = cleanStr.replace(/,/g, '');
    } else if (parts.length > 2) {
      cleanStr = cleanStr.replace(/,/g, '');
    } else {
      cleanStr = cleanStr.replace(',', '.');
    }
  } else if (hasDot) {
    const parts = cleanStr.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      // 53.900 -> 53900
      cleanStr = cleanStr.replace(/\./g, '');
    } else if (parts.length > 2) {
      cleanStr = cleanStr.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? undefined : parsed;
}

export function getProductPrices(product: Product): { pricePublic: number; priceConfidential: number } {
  const isOff = product.status?.toUpperCase() === 'OFF';

  let pricePublic = 0;
  let priceConfidential = 0;

  if (isOff) {
    // Column S (pricePublicDiscounted) and Column Q (priceConfidentialDiscounted) for OFF products
    pricePublic = (product.pricePublicDiscounted !== undefined && product.pricePublicDiscounted > 0)
      ? product.pricePublicDiscounted
      : (product.pricePublic || 0);

    priceConfidential = (product.priceConfidentialDiscounted !== undefined && product.priceConfidentialDiscounted > 0)
      ? product.priceConfidentialDiscounted
      : (product.priceConfidential || 0);
  } else {
    // Column N (pricePublic) and Column O (priceConfidential) for LINEA products
    pricePublic = product.pricePublic || 0;
    priceConfidential = product.priceConfidential || 0;
  }

  // Remove decimals from confidential prices
  priceConfidential = Math.round(priceConfidential);

  return { pricePublic, priceConfidential };
}

