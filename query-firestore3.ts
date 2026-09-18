import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const fbConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(fbConfig);
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, 'config', 'sheets');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("SheetConfig in Firestore:", snap.data());
  } else {
    console.log("No config found in Firestore");
  }
  process.exit(0);
}
check();
