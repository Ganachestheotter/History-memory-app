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

async function gunzipBytes(bytes) {
  if (typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  const { ungzip } = await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(ungzip(bytes));
}

async function loadCompressed(paths) {
  const parts = await Promise.all(paths.map(async (path) => {
    const r = await fetch(path + '?v=021', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' · ' + path);
    return (await r.text()).trim();
  }));
  const joined = parts.join('').replace(/\\s+/g, '');\n  const padded = joined + '='.repeat((4 - (joined.length % 4)) % 4);\n  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return await gunzipBytes(bytes);
}

function fail(err) {
  console.error('History app load error:', err);
  const msg = String(err?.message || err || 'unknown').slice(0, 160);
  if (app) app.innerHTML =
    '<div class="shell"><div class="card" style="margin-top:20vh">' +
    '<h2>載入失敗</h2><p>請重新整理頁面再試。</p>' +
    '<p class="tiny muted">錯誤：' + msg.replace(/[<>&]/g, '') + '</p>' +
    '</div></div>';
}

try {
  if (app) app.innerHTML = '<div class="shell"><div class="card" style="margin-top:20vh;text-align:center"><b>載入中…</b></div></div>';
  const questionsCode = await loadCompressed([
    './payload/questions-0.gz.b64',
    './payload/questions-1.gz.b64'
  ]);
  (0, eval)(questionsCode);

  const appCode = await loadCompressed(['./payload/app.js.gz.b64']);
  (0, eval)(appCode);
} catch (err) {
  fail(err);
}
