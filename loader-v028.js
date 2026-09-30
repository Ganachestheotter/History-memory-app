import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  initializeAuth,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where
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
const auth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence
});
const db = getFirestore(firebaseApp);

function firebasePasswordFromPin(value) {
  const text = String(value ?? '');
  return /^\d{4}$/.test(text) ? 'HistoryMemory-PIN-' + text + '-v1' : text;
}

const PinEmailAuthProvider = {
  credential(email, password) {
    return EmailAuthProvider.credential(email, firebasePasswordFromPin(password));
  },
  credentialWithLink(email, emailLink) {
    return EmailAuthProvider.credentialWithLink(email, emailLink);
  },
  PROVIDER_ID: EmailAuthProvider.PROVIDER_ID,
  EMAIL_PASSWORD_SIGN_IN_METHOD: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
  EMAIL_LINK_SIGN_IN_METHOD: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
};

window.FIREBASE_SERVICES = {
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword(authInstance, email, pin) {
    return createUserWithEmailAndPassword(
      authInstance,
      email,
      firebasePasswordFromPin(pin)
    );
  },
  signInWithEmailAndPassword(authInstance, email, pin) {
    return signInWithEmailAndPassword(
      authInstance,
      email,
      firebasePasswordFromPin(pin)
    );
  },
  signOut,
  updateEmail,
  updatePassword(user, pin) {
    return updatePassword(user, firebasePasswordFromPin(pin));
  },
  reauthenticateWithCredential,
  EmailAuthProvider: PinEmailAuthProvider,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where
};

const app = document.getElementById('app');
let loadStage = '初始化';

function reportFirebaseIssue(stage, err, detail = '') {
  console.error(stage, detail, err);
  const code = String(err && err.code ? err.code : '');
  const message = String(err && err.message ? err.message : err || 'unknown');
  const text = [stage, code, detail, message].filter(Boolean).join(' · ').slice(0, 360);

  let box = document.getElementById('firebase-debug');
  if (!box) {
    box = document.createElement('div');
    box.id = 'firebase-debug';
    box.style.cssText =
      'position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;' +
      'max-width:720px;margin:auto;padding:12px 14px;border-radius:14px;' +
      'background:#fff3f3;color:#8a1c1c;border:1px solid #ffc9c9;' +
      'font:13px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 8px 30px #0002';
    document.body.appendChild(box);
  }
  box.textContent = 'Firebase：' + text;
}

const rawCreateUser = window.FIREBASE_SERVICES.createUserWithEmailAndPassword;
window.FIREBASE_SERVICES.createUserWithEmailAndPassword = async function(authInstance, email, pin) {
  try {
    return await rawCreateUser(authInstance, email, pin);
  } catch (err) {
    reportFirebaseIssue('建立帳戶', err, email);
    throw err;
  }
};

const rawSignIn = window.FIREBASE_SERVICES.signInWithEmailAndPassword;
window.FIREBASE_SERVICES.signInWithEmailAndPassword = async function(authInstance, email, pin) {
  try {
    return await rawSignIn(authInstance, email, pin);
  } catch (err) {
    reportFirebaseIssue('登入', err, email);
    throw err;
  }
};

const rawSetDoc = window.FIREBASE_SERVICES.setDoc;
window.FIREBASE_SERVICES.setDoc = async function(ref, data, options) {
  try {
    return options === undefined
      ? await rawSetDoc(ref, data)
      : await rawSetDoc(ref, data, options);
  } catch (err) {
    reportFirebaseIssue('儲存資料', err, ref && ref.path ? ref.path : '');
    throw err;
  }
};

const rawUpdateDoc = window.FIREBASE_SERVICES.updateDoc;
window.FIREBASE_SERVICES.updateDoc = async function(ref, ...args) {
  try {
    return await rawUpdateDoc(ref, ...args);
  } catch (err) {
    reportFirebaseIssue('更新資料', err, ref && ref.path ? ref.path : '');
    throw err;
  }
};

function showLoading() {
  if (!app) return;
  app.innerHTML =
    '<div class="shell"><div class="card" style="margin-top:20vh;text-align:center">' +
    '<b>載入中…</b></div></div>';
}

function showError(err) {
  console.error('History app load error:', loadStage, err);
  if (!app) return;

  const raw = String(err && err.message ? err.message : err || 'unknown');
  const safe = (loadStage + '：' + raw)
    .slice(0, 240)
    .replace(/[<>&]/g, '');

  app.innerHTML =
    '<div class="shell"><div class="card" style="margin-top:20vh">' +
    '<h2>載入失敗</h2>' +
    '<p>請重新整理頁面再試。</p>' +
    '<p class="tiny muted">錯誤：' + safe + '</p>' +
    '</div></div>';
}

async function gunzipBytes(bytes) {
  if (typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }

  loadStage = '載入相容解壓縮工具';
  const pako = await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(pako.ungzip(bytes));
}

async function loadCompressed(paths) {
  loadStage = '下載程式資料';

  const parts = [];
  for (const path of paths) {
    const response = await fetch(path + '?v=028', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ' · ' + path);
    }

    parts.push((await response.text()).trim());
  }

  loadStage = '解碼程式資料';

  const joined = parts.join('').replace(/\s+/g, '');
  const padLength = (4 - (joined.length % 4)) % 4;
  const padded = joined + '='.repeat(padLength);
  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  loadStage = '解壓縮程式資料';
  return await gunzipBytes(bytes);
}

showLoading();

try {
  const questionsCode = await loadCompressed([
    './payload/questions-0.gz.b64',
    './payload/questions-1.gz.b64'
  ]);

  loadStage = '啟動題庫';
  (0, eval)(questionsCode);

  const appCode = await loadCompressed([
    './payload/app.js.gz.b64'
  ]);

  loadStage = '啟動應用程式';
  (0, eval)(appCode);
} catch (err) {
  showError(err);
}
