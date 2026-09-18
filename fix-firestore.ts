import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-b2bgrupodass-91b73020-b095-4026-98ba-e261c5e6aed3");

async function run() {
  const existingSnap = await getDocs(collection(db, 'products'));
  const docsToDelete: string[] = [];
  existingSnap.forEach(docSnap => {
    // If docId contains hyphens (like '1398431-66862U-NHU'), we delete it
    if (docSnap.id.includes('-')) {
      docsToDelete.push(docSnap.id);
    }
  });
  
  console.log("Deleting", docsToDelete.length, "bad documents...");
  
  const CHUNK_SIZE = 500;
  for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
    const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(id => {
      batch.delete(doc(db, 'products', id));
    });
    await batch.commit();
    console.log(`Deleted batch ${i / CHUNK_SIZE + 1}`);
  }
  
  console.log("Done fixing Firestore.");
  process.exit(0);
}
run().catch(console.error);
