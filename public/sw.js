/* Service Worker — کش آفلاین پوسته‌ی برنامه (network-first) */
const CACHE = "atash-o-daneh-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(e.request);
        if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
          cache.put(e.request, res.clone());
        }
        return res;
      } catch {
        const hit = await cache.match(e.request);
        return hit || (await cache.match("./")) || Response.error();
      }
    }),
  );
});
