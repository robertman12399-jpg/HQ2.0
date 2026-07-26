/* FizMat HQ — Service Worker
   Кэширует приложение для работы офлайн.
   Стратегия: network-first для HTML (всегда свежая версия если есть сеть),
   cache-first для статики (иконки, CDN-библиотеки). */

const CACHE = "fizmat-hq-v1";

// Файлы, которые кэшируем при установке
const PRECACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

// CDN-библиотеки (React, Babel, Supabase) — кэшируем при первом запросе
const CDN_HOSTS = [
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // Cache each file individually so one missing file doesn't break the whole install
      Promise.all(PRECACHE.map((url) =>
        c.add(url).catch((err) => console.log("SW: пропущен файл", url))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Не трогаем запросы к Supabase (нужны живые данные)
  if (url.hostname.includes("supabase")) return;

  // CDN-библиотеки и шрифты: cache-first
  if (CDN_HOSTS.some((h) => url.hostname.includes(h))) {
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached || fetch(e.request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        }).catch(() => cached)
      )
    );
    return;
  }

  // HTML и локальные файлы: network-first, fallback на кэш (офлайн)
  if (e.request.method === "GET" && url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
  }
});
