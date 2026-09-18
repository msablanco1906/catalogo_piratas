import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel } from 'firebase/firestore';

setLogLevel('silent');
import { getAuth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const firebaseConfig = firebaseConfigJson;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: memoryLocalCache(),
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = firestoreInstance;

export const auth = getAuth(app);

const secondaryApp =
  getApps().find((a) => a.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');

export const secondaryAuth = getAuth(secondaryApp);

