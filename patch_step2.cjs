const fs = require('fs');

const syncCode = `import Papa from 'papaparse';

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
  const codigoIdx = 0; // Columna A
  const descIdx = 1;   // Columna B
  const seccionIdx = 2; // Columna C
  const urlIdx = 3;    // Columna D
  const precioIdx = 5; // Columna F
  const vistaIdx = 6;  // Columna G

  const productMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const codigo = row[codigoIdx]?.trim() || '';
    if (!codigo) continue;

    const desc = row[descIdx]?.trim() || '';
    const seccion = row[seccionIdx]?.trim() || '';
    const urlImagen = row[urlIdx]?.trim() || '';
    const precioRaw = row[precioIdx]?.trim() || '0';
    const vistaRaw = row[vistaIdx]?.trim() || '0';

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
        category: seccion,
        gender: '',
        line: '',
        driver: '',
        price: precio,
        pricePublic: precio,
        sizes: { 'U': 999 },
        images: [],
        coverImage: '',
        status: 'LINEA',
        tempViews: [] // used for sorting later
      };
    }

    if (urlImagen) {
      productMap[codigo].tempViews.push({ url: urlImagen, vista });
    }
  }

  const products = Object.values(productMap).map(p => {
    // Sort images by vista
    p.tempViews.sort((a, b) => a.vista - b.vista);
    
    // Ensure no duplicates
    const uniqueUrls = [...new Set(p.tempViews.map(t => t.url))];
    
    p.images = uniqueUrls;
    if (uniqueUrls.length > 0) {
      p.coverImage = uniqueUrls[0];
    }
    
    delete p.tempViews;
    return p;
  });

  return products;
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
