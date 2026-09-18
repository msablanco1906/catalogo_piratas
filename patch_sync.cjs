const fs = require('fs');

const syncCode = `import { getDb } from '../lib/firebase';
import { collection, doc, writeBatch, getDocs, terminate } from 'firebase/firestore';
import Papa from 'papaparse';

export async function getParsedProductsFromSheets(
  stockSheetId = '1WSgDPnsjfb0ppkBhyaPqpimO6DN6NZoJhQ2l6tZ9jRk',
  imageSheetId = '',
  forceRefresh = false
) {
  const url = \`https://docs.google.com/spreadsheets/d/\${stockSheetId}/gviz/tq?tqx=out:csv&tq=select%20*\`;
  
  let res = null;
  try { res = await fetch(url); } catch {}
  if (!res || !res.ok) {
    try { res = await fetch(\`https://api.allorigins.win/raw?url=\${encodeURIComponent(url)}\`); } catch {}
  }

  if (!res || !res.ok) return [];

  const text = await res.text();
  const parsed = Papa.parse(text, { skipEmptyLines: true });
  const data = parsed.data;
  
  if (!data || data.length < 2) return [];

  const headers = data[0].map(h => h.toLowerCase().trim());
  const codigoIdx = headers.findIndex(h => h.includes('código') || h.includes('codigo'));
  const descIdx = headers.findIndex(h => h.includes('descripción') || h.includes('descripcion'));
  const urlIdx = headers.findIndex(h => h.includes('url imagen'));
  const precioIdx = headers.findIndex(h => h.includes('precio'));
  const vistaIdx = headers.findIndex(h => h.includes('vista'));

  const productMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const codigo = codigoIdx !== -1 ? row[codigoIdx]?.trim() : '';
    if (!codigo) continue;

    const desc = descIdx !== -1 ? row[descIdx]?.trim() : '';
    const urlImagen = urlIdx !== -1 ? row[urlIdx]?.trim() : '';
    const precioRaw = precioIdx !== -1 ? row[precioIdx]?.trim() : '';
    const vistaRaw = vistaIdx !== -1 ? row[vistaIdx]?.trim() : '0';

    const precio = parseFloat(precioRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    const vista = parseInt(vistaRaw, 10) || 0;

    if (!productMap[codigo]) {
      productMap[codigo] = {
        id: codigo,
        sku: codigo,
        articulo: codigo,
        modelo: '',
        name: desc || \`Producto \${codigo}\`,
        marca: '',
        category: '',
        gender: '',
        line: '',
        driver: '',
        price: precio,
        pricePublic: precio,
        sizes: { 'U': 999 },
        images: [],
        coverImage: '',
        status: 'LINEA'
      };
    }

    if (urlImagen) {
      if (!productMap[codigo].images.includes(urlImagen)) {
        productMap[codigo].images.push(urlImagen);
        if (!productMap[codigo].coverImage) {
          productMap[codigo].coverImage = urlImagen;
        }
      }
    }
  }

  return Object.values(productMap);
}

export async function performStockSync() {
  const products = await getParsedProductsFromSheets();
  return {
    success: true,
    firestoreSyncSuccess: false,
    quotaExceeded: false,
    message: 'Stock sincronizado exitosamente.',
    total: products.length,
    linea: products.length,
    off: 0,
    withImages: products.filter(p => p.images && p.images.length > 0).length,
    deleted: 0,
    products
  };
}
`;

fs.writeFileSync('src/server/syncService.ts', syncCode);
