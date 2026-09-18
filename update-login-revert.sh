sed -i 's/signInAnonymously/signInWithEmailAndPassword/g' src/components/LoginView.tsx
sed -i 's/const cred = await signInWithEmailAndPassword(auth);/await signInWithEmailAndPassword(auth, email, password);/g' src/components/LoginView.tsx
sed -i '/const role = /d' src/components/LoginView.tsx
sed -i '/await setDoc(doc(db, "users", cred.user.uid)/d' src/components/LoginView.tsx
