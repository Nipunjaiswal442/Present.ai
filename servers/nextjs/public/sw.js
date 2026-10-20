/* Only the public offline screen is cached. Never cache sessions, keys or decks. */
const CACHE = "presentai-offline-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("presentai-offline-") && key !== CACHE)
      .map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || event.request.mode !== "navigate" ||
      url.origin !== self.location.origin ||
      /^\/(api|app_data|static|_next)(\/|$)/.test(url.pathname)) return;
  event.respondWith(fetch(event.request).catch(async () =>
    (await caches.match(OFFLINE)) || Response.error()
  ));
});
