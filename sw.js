/* Service worker do site DYOLIVEIRAYT: permite instalar como app e abrir com sinal fraco.
   Páginas, scripts e estilos: busca sempre a versão nova e usa a guardada só sem internet.
   Imagens do próprio site: usa a guardada na hora e atualiza em segundo plano. */
var CACHE = "dy-v1";
var BASE = ["./", "index.html", "css/style.css", "js/config.js", "js/auto.js", "js/roleta-cenas.js", "js/app.js",
  "assets/logo-neon.jpg", "assets/logo-wordmark-strip.jpg", "assets/moto-velocross.png", "assets/app/icone-192.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // YouTube, Shopee, anúncios: direto da internet
  var imagem = /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname);
  if (imagem) {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (guardada) {
        var nova = fetch(req).then(function (r) { if (r.ok) c.put(req, r.clone()); return r; }).catch(function () { return guardada; });
        return guardada || nova;
      });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    if (r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
    return r;
  }).catch(function () {
    return caches.match(req).then(function (g) { return g || caches.match("index.html"); });
  }));
});
