const CACHE='history-memory-v0.2.1-compat';
const ASSETS=[
  './','./index.html','./styles.css','./loader.js','./manifest.webmanifest',
  './payload/app.js.gz.b64',
  './payload/questions-0.gz.b64',
  './payload/questions-1.gz.b64'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));
