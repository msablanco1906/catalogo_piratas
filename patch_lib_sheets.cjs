const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

// The client fallback parser should match the server parser.
const clientCode = `import Papa from 'papaparse';
import { Product } from '../types';

export async function getProducts(
  stockSheetId: string = '1WSgDPnsjfb0ppkBhyaPqpimO6DN6NZoJhQ2l6tZ9jRk'
): Promise<Product[]> {
  const url = \`https://docs.google.com/spreadsheets/d/\${stockSheetId}/gviz/tq?tqx=out:csv&tq=select%20*\`;
  
  let res: Response | null = null;
  try { res = await fetch(url); } catch {}
  if (!res || !res.ok) {
    try { res = await fetch(\`https://api.allorigins.win/raw?url=\${encodeURIComponent(url)}\`); } catch {}
  }

  if (!res || !res.ok) return [];

  const text = await res.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const data = parsed.data;
  
  if (!data || data.length < 2) return [];

  const codigoIdx = 0; // Columna A
  const descIdx = 1;   // Columna B
  const seccionIdx = 2; // Columna C
  const urlIdx = 3;    // Columna D
  const precioIdx = 5; // Columna F
  const vistaIdx = 6;  // Columna G

  const productMap: Record<string, Product & { tempViews: { url: string, vista: number }[] }> = {};

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
        tempViews: []
      };
    }

    if (urlImagen) {
      productMap[codigo].tempViews.push({ url: urlImagen, vista });
    }
  }

  const products = Object.values(productMap).map(p => {
    p.tempViews.sort((a, b) => a.vista - b.vista);
    const uniqueUrls = [...new Set(p.tempViews.map(t => t.url))];
    p.images = uniqueUrls;
    if (uniqueUrls.length > 0) {
      p.coverImage = uniqueUrls[0];
    }
    const { tempViews, ...rest } = p;
    return rest as Product;
  });

  return products;
}
`;

fs.writeFileSync('src/lib/sheets.ts', clientCode);
