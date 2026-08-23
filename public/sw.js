/* GramaCare service worker — app shell + language + emergency guidance cache.
   Real-time availability (medicine stock, blood stock, hospital status) is
   intentionally NOT cached, so users never see stale availability offline. */
const CACHE = "gramacare-v1";
const SHELL = ["/", "/emergency", "/education", "/icon.svg", "/manifest.webmanifest"];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache availability APIs — they must be fresh when a network exists.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).catch(() => new Response("{}", { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (request.destination !== "document" || url.pathname === "/")) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/")),
      ),
  );
});
