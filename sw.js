// Service worker del Cuaderno de japonés.
// Estrategia:
//  - Navegación (el index.html): PRIMERO red, y si no hay internet, la copia
//    en caché. Así las actualizaciones que subas a GitHub llegan siempre que
//    estés online, y sin conexión la app sigue abriéndose.
//  - Resto (iconos, fuentes…): caché primero, actualizando en segundo plano.
const CACHE = "cuaderno-japones-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
