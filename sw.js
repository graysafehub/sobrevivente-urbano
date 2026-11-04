// Guarda os arquivos do app no aparelho para abrir sem internet.
// Ao mudar qualquer arquivo, suba a versão para o celular baixar de novo.
const CACHE = "su-v3";
const ARQUIVOS = [
  "./", "index.html", "styles.css", "app.js", "seed.js", "manifest.webmanifest",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const FONTES = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // fonte: guarda na primeira vez que abrir com internet; offline usa a cópia
  if (FONTES.test(e.request.url)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
