const CACHE="mahjong-complete-v25";
const CORE=["./","./index.html","./style.css?v=26","./app.js?v=26","./manifest.json?v=26","./app-icon-32-v17.png","./app-icon-192-v17.png","./app-icon-512-v17.png","./title-calculator-v9.png","./title-score-table.svg","./r5m.png","./r5p.png","./r5s.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  // ONNX分割モデルはService Workerで一切処理しない。
  // returnだけにすることで、iOS Safariでも通常のネットワーク要求として処理される。
  if(u.origin===self.location.origin && /\/model\/tile-detector\.part\d+$/.test(u.pathname)){
    return;
  }
  // 牌画像はネットワーク優先。
  if(u.origin===self.location.origin && u.pathname.endsWith(".png") && /\/tile-(?:[1-9][mps]|[1-7]z|back)\.png$/.test(u.pathname)){
    e.respondWith(fetch(e.request,{cache:"no-store"})); return;
  }
  // 外部通信はService Workerで横取りしない。
  if(u.origin!==self.location.origin) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
