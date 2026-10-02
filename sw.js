/* Kindred Creatures service worker: network-first with an offline fallback.
   VERSION is written by scripts/release.sh; changing it makes browsers install the new worker. */
const VERSION="3.0.0";
const CACHE="kw-"+VERSION;
const CORE=["./","index.html","css/style.css","js/version.js","js/data.js","js/laws.js","js/creatures.js","js/platform.js","js/art.js","js/fauna.js","js/flora.js","js/map.js","js/app.js","js/updater.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;const url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;     // iNaturalist, fonts, Anthropic: straight to the network
  if(url.pathname.endsWith("version.json"))return;                  // always fresh
  e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;})
    .catch(()=>caches.match(req).then(r=>r||caches.match("index.html"))));
});
