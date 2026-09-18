import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-b2bgrupodass-91b73020-b095-4026-98ba-e261c5e6aed3");

async function run() {
  const existingSnap = await getDocs(collection(db, 'products'));
  const allProducts: any[] = [];
  existingSnap.forEach(docSnap => {
    allProducts.push({docId: docSnap.id, dataId: docSnap.data().id, sku: docSnap.data().sku, name: docSnap.data().name});
  });
  
  const duplicatedIds = allProducts.filter(p => p.sku === '66862U_NHU');
  console.log("Found 66862U_NHU:", duplicatedIds);
  
  const bySku: Record<string, any[]> = {};
  for (const p of allProducts) {
    if (!bySku[p.sku]) bySku[p.sku] = [];
    bySku[p.sku].push(p);
  }
  
  const dups = Object.keys(bySku).filter(k => bySku[k].length > 1);
  console.log("Duplicated SKUs count:", dups.length);
  for (const dup of dups.slice(0, 5)) {
    console.log("Dup:", dup, bySku[dup]);
  }
  process.exit(0);
}
run().catch(console.error);
