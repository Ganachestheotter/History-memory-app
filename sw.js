const CACHE='history-memory-v0.2.4';
const ASSETS=[
  './','./index.html','./fresh.html','./styles.css','./loader-v024.js','./manifest.webmanifest',
  './payload/app.js.gz.b64','./payload/questions-0.gz.b64','./payload/questions-1.gz.b64'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if (event.request.mode === 'navigate' || event.request.destination === 'script') {
    event.respondWith(
      fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
