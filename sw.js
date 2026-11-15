// Volley Manager — service worker (gra działa offline po pierwszym otwarciu)
const CACHE='volley-manager-v86';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isPage=e.request.mode==='navigate';
  if(isPage){ // najpierw sieć (żeby dostać nowszą wersję), offline — z pamięci
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));
  }else{
    // widok 3D: pliki z folderu 3d/ zapisywane w pamięci przy pierwszym pobraniu (potem działa offline)
    const is3d=new URL(e.request.url).pathname.includes('/3d/');
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(is3d&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;})));
  }
});
