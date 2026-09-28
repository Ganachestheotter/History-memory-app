import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  initializeAuth, browserLocalPersistence, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection,
  onSnapshot, query, where
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDQ1iEhjlNd3jWiLztTNYAb0uoR3LmWykQ',
  authDomain: 'history-memory-app.firebaseapp.com',
  projectId: 'history-memory-app',
  storageBucket: 'history-memory-app.firebasestorage.app',
  messagingSenderId: '768621450348',
  appId: '1:768621450348:web:272193a74a201b8a4d7449'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = initializeAuth(firebaseApp, { persistence: browserLocalPersistence });
const db = getFirestore(firebaseApp);

window.FIREBASE_SERVICES = {
  auth, db, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider,
  doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where
};

const app = document.getElementById('app');

async function loadCompressed(paths) {
  const parts = await Promise.all(paths.map(async (path) => {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error('載入失敗');
    return (await r.text()).trim();
  }));
  const binary = atob(parts.join(''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

try {
  if (typeof DecompressionStream === 'undefined') throw new Error('請更新瀏覽器');
  if (app) app.innerHTML = '<div class="shell"><div class="card" style="margin-top:20vh;text-align:center"><b>載入中…</b></div></div>';
  const questionsCode = await loadCompressed(['./payload/questions-0.gz.b64','./payload/questions-1.gz.b64']);
  (0, eval)(questionsCode);
  const appCode = await loadCompressed(['./payload/app.js.gz.b64']);
  (0, eval)(appCode);
} catch (err) {
  console.error(err);
  if (app) app.innerHTML = '<div class="shell"><div class="card" style="margin-top:20vh"><h2>載入失敗</h2><p>請重新整理頁面再試。</p></div></div>';
}