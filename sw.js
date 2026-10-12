const CACHE='training-log-v7-20261012';
const ASSETS=['./','./index.html','./manifest.webmanifest','./fixes.css','./v3.css','./enhancements.js','./v4.js','./v4.css','./v5.js','./v5.css','./v6.js','./v6.css','./training-core.mjs'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('training-log-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const u=new URL(e.request.url);
 if(u.pathname.includes('/api/')||u.pathname.includes('/contents/'))return;
 e.respondWith(fetch(e.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}
   return response;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
