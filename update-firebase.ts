import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import * as fs from 'fs';
import Papa from 'papaparse';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-b2bgrupodass-91b73020-b095-4026-98ba-e261c5e6aed3");

async function fetchSheetData(spreadsheetId: string): Promise<string[][]> {
  const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
  const res = await fetch(exportUrl);
  const text = await res.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  return parsed.data;
}

async function run() {
  console.log("Fetching from Google Sheets...");
  const stockData = await fetchSheetData('1nQUwfBV8eJhBelRu0XMYEXDqz-lfP8g06cc2sMldVq0');
  
  let localCsvData: string[][] = [];
  try {
     const csvText = fs.readFileSync('Url Stock.csv', 'utf8');
     localCsvData = Papa.parse<string[]>(csvText, { skipEmptyLines: true, delimiter: ';' }).data;
  } catch (err) {
     console.error("Error reading local images", err);
  }

  const productMap: Record<string, any> = {};
  const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  
  const tempImageMap: Record<string, { vista: number; url: string }[]> = {};

  const addImageToMap = (key: string, vista: number, url: string) => {
    if (!key || !url) return;
    const normKey = normalize(key);
    if (!normKey) return;
    if (!tempImageMap[normKey]) tempImageMap[normKey] = [];
    tempImageMap[normKey].push({ vista, url });
  };

  if (localCsvData && localCsvData.length > 0) {
    for (let i = 1; i < localCsvData.length; i++) {
      const row = localCsvData[i];
      if (row.length >= 3) {
        const rawSku = row[0] ? row[0].trim() : '';
        const vista = parseInt(row[1], 10);
        const url = row[2] ? row[2].trim() : '';
        if (rawSku && url) {
          const v = isNaN(vista) ? 99 : vista;
          addImageToMap(rawSku, v, url);

          // Handle color code zero-padding/stripping and model prefix variants
          const parts = rawSku.split(/[-_]/);
          if (parts.length >= 2) {
            const model = parts[0];
            const color = parts.slice(1).join('');
            if (/^\d+$/.test(color)) {
              const num = parseInt(color, 10);
              addImageToMap(`${model}_${num}`, v, url);
              addImageToMap(`${model}_${String(num).padStart(2, '0')}`, v, url);
              addImageToMap(`${model}_${String(num).padStart(3, '0')}`, v, url);
              addImageToMap(`${model}_${String(num).padStart(4, '0')}`, v, url);
            }
            if (model.startsWith('0')) {
              addImageToMap(`${model.replace(/^0+/, '')}_${color}`, v, url);
            }
          }
        }
      }
    }
  }

  const imageMap: Record<string, string[]> = {};
  for (const [key, items] of Object.entries(tempImageMap)) {
    items.sort((a, b) => a.vista - b.vista);
    const uniqueUrls = Array.from(new Set(items.map(item => item.url)));
    imageMap[key] = uniqueUrls;
  }

  const findImagesForProduct = (sku: string, articulo: string, modelo: string, colorCode: string): string[] => {
    const candidateKeys = [
      sku,
      articulo,
      modelo && colorCode ? `${modelo}_${colorCode}` : '',
      modelo && colorCode ? `${modelo}_0${colorCode}` : '',
      modelo && colorCode ? `${modelo}_00${colorCode}` : '',
      modelo && colorCode ? `${modelo}_000${colorCode}` : '',
      modelo,
    ];
    for (const k of candidateKeys) {
      if (!k) continue;
      const norm = normalize(k);
      if (imageMap[norm] && imageMap[norm].length > 0) {
        return imageMap[norm];
      }
    }
    return [];
  };

  const parsePrice = (val: string | undefined): number | undefined => {
    if (!val) return undefined;
    const str = String(val).trim();
    if (!str) return undefined;
    let cleanStr = str.replace(/[^0-9.,-]/g, '');
    if (!cleanStr) return undefined;
    if (cleanStr.includes(',') && cleanStr.includes('.')) {
      if (cleanStr.indexOf(',') > cleanStr.indexOf('.')) {
        cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
      } else {
        cleanStr = cleanStr.replace(/,/g, '');
      }
    } else if (cleanStr.includes(',')) {
      cleanStr = cleanStr.replace(',', '.');
    }
    const num = parseFloat(cleanStr);
    return isNaN(num) ? undefined : num;
  };

  const headers = stockData[0].map((h) => h.toLowerCase().trim());
  
  const getIdx = (keywords: string[]) => 
    headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const skuIdx = getIdx(['sku']);
  const modeloIdx = getIdx(['modelo']);
  const marcaIdx = getIdx(['marca']);
  const artIdx = getIdx(['articulo']);
  const descIdx = getIdx(['descripcion', 'descripción']);
  const colorCodeIdx = getIdx(['codigo color', 'código color']);
  const colorDescIdx = getIdx(['descripcion color', 'descripción color']);
  const catIdx = getIdx(['division', 'categoría', 'categoria']);
  const genIdx = getIdx(['genero', 'género']);
  const lineIdx = getIdx(['disciplina', 'linea', 'línea']);
  const driverIdx = getIdx(['driver']);
  const sizeIdx = getIdx(['talle', 'size']);
  const stockIdx = getIdx(['stock disponible', 'stock']);
  const priceIdx = getIdx(['precio', 'price']);
  const pricePublicIdx = getIdx(['precio publico', 'precio público', 'publico']);
  const priceConfidentialIdx = getIdx(['precio confidencial', 'confidencial']);
  const discountIdx = getIdx(['descuento']) !== -1 ? getIdx(['descuento']) : 15; // Column P is index 15
  const finalPriceConfIdx = 14; // Column O is index 14, as requested
  const finalPriceConfDiscountedIdx = 16; // Column Q is index 16
  const statusIdx = 17; // Column R is index 17
  const finalPricePublicDiscountedIdx = 18; // Column S is index 18

  const finalPricePublicIdx = pricePublicIdx !== -1 ? pricePublicIdx : 13;
  
  for (let i = 1; i < stockData.length; i++) {
    const row = stockData[i];
    if (!row || row.length === 0) continue;

    const articulo = artIdx !== -1 ? String(row[artIdx]).trim() : '';
    const modelo = modeloIdx !== -1 ? String(row[modeloIdx]).trim() : '';
    const colorCode = colorCodeIdx !== -1 ? String(row[colorCodeIdx]).trim() : '';
    const sku = skuIdx !== -1 ? String(row[skuIdx]).trim() : '';

    const id = articulo || sku;
    if (!id) continue;

    

    if (!productMap[id]) {
      const marca = marcaIdx !== -1 ? String(row[marcaIdx]).trim() : '';
      let name = descIdx !== -1 ? String(row[descIdx]).trim() : '';
      const category = catIdx !== -1 ? String(row[catIdx]).trim() : '';
      const gender = genIdx !== -1 ? String(row[genIdx]).trim() : '';
      const line = lineIdx !== -1 ? String(row[lineIdx]).trim() : '';
      const driver = driverIdx !== -1 ? String(row[driverIdx]).trim() : '';
      const colorDesc = colorDescIdx !== -1 ? String(row[colorDescIdx]).trim() : '';
      if (colorDesc) name += ` - ${colorDesc}`;
      if (!name && modelo) name = modelo;
      if (!name) name = `Product ${id}`;

      productMap[id] = {
        id,
        sku,
        articulo,
        modelo,
        marca,
        name,
        category,
        gender,
        line,
        driver,
        colorCode,
        colorDesc,
        status: row[statusIdx] ? String(row[statusIdx]).trim().toUpperCase() : undefined,
        discount: row[discountIdx] ? String(row[discountIdx]).trim() : undefined,
        price: priceIdx !== -1 ? parsePrice(row[priceIdx]) : undefined,
        priceConfidential: parsePrice(row[finalPriceConfIdx]),
        priceConfidentialDiscounted: parsePrice(row[finalPriceConfDiscountedIdx]),
        pricePublic: parsePrice(row[finalPricePublicIdx]),
        pricePublicDiscounted: parsePrice(row[finalPricePublicDiscountedIdx]),
        sizes: {},
        images: [],
        coverImage: '',
      };

      const images = findImagesForProduct(sku, articulo, modelo, colorCode);
      if (images.length > 0) {
        productMap[id] = {
          ...productMap[id],
          images,
          coverImage: images[0] || '',
        };
      }
    } else {
      const newStatus = row[statusIdx] ? String(row[statusIdx]).trim().toUpperCase() : undefined;
      if (newStatus) {
        if (!productMap[id].status || productMap[id].status === '') {
          productMap[id].status = newStatus;
        } else if (newStatus === 'LINEA' && productMap[id].status !== 'LINEA') {
          productMap[id].status = 'LINEA';
        }
      }

      const extraImages = findImagesForProduct(sku, articulo, row[modeloIdx] || '', row[colorCodeIdx] || '');
      if (extraImages.length > 0) {
        for (const img of extraImages) {
          if (!productMap[id].images.includes(img)) {
            productMap[id].images.push(img);
          }
        }
        if (!productMap[id].coverImage && productMap[id].images.length > 0) {
          productMap[id].coverImage = productMap[id].images[0];
        }
      }
    }

    let size = sizeIdx !== -1 && row[sizeIdx] ? String(row[sizeIdx]).trim() : '';
    if (!size) size = 'U';

    let stock = 0;
    if (stockIdx !== -1 && row[stockIdx]) {
      const stockStr = String(row[stockIdx]).replace(/[^0-9-]/g, '');
      stock = parseInt(stockStr, 10);
      if (isNaN(stock)) stock = 0;
    }

    productMap[id].sizes[size] = (productMap[id].sizes[size] || 0) + stock;
  }

  const data = Object.values(productMap);
  console.log("Fetched products:", data.length);
  const linea = data.filter(p => p.status === 'LINEA');
  console.log("LINEA products from sheets:", linea.length);

  console.log("Updating Firebase...");
  const CHUNK_SIZE = 500;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(p => {
      const docRef = doc(collection(db, 'products'), p.id);
      const cleanP = Object.fromEntries(Object.entries(p).filter(([_, v]) => v !== undefined));
      batch.set(docRef, cleanP);
    });
    await batch.commit();
    console.log(`Committed batch ${i / CHUNK_SIZE + 1}`);
  }
  
  const existingSnap = await getDocs(collection(db, 'products'));
  const newProductIds = new Set(data.map(p => p.id));
  const docsToDelete: string[] = [];
  existingSnap.forEach(docSnap => {
    if (!newProductIds.has(docSnap.id)) {
      docsToDelete.push(docSnap.id);
    }
  });
  
  for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
    const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(id => {
      batch.delete(doc(db, 'products', id));
    });
    await batch.commit();
    console.log(`Deleted batch ${i / CHUNK_SIZE + 1}`);
  }
  
  console.log("Done syncing to Firebase!");
}

run().catch(console.error);
