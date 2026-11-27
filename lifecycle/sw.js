/* =====================================================
   NEPTOON LIFE CYCLE · PWA SERVICE WORKER
===================================================== */

const CACHE_NAME = "neptoon-lifecycle-shell-v2";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

  event.waitUntil((async () => {

    const cache = await caches.open(CACHE_NAME);

    await Promise.allSettled(
      SHELL_URLS.map(url => cache.add(url))
    );

    await self.skipWaiting();

  })());

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

  event.waitUntil((async () => {

    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith("neptoon-lifecycle-shell-") &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();

  })());

});


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (
    !url.pathname.startsWith(
      new URL(self.registration.scope).pathname
    )
  ) return;


  /* =====================================
     APPLE INSTALLATION · DIRECT DOWNLOAD
  ===================================== */

  if (url.pathname.toLowerCase().endsWith(".mobileconfig")) {

    return;

  }


  /* =====================================
     HTML · NETWORK FIRST
  ===================================== */

  if (request.mode !== "navigate") return;

  event.respondWith((async () => {

    try {

      const response = await fetch(request, {
        cache: "no-store"
      });

      const contentType =
        response.headers.get("content-type") || "";

      const appRoot =
        new URL(self.registration.scope).pathname;

      const isAppShell =
        url.pathname === appRoot ||
        url.pathname === appRoot + "index.html";

      if (
        response.ok &&
        isAppShell &&
        contentType.includes("text/html")
      ) {

        const cache = await caches.open(CACHE_NAME);

        await cache.put(
          "./index.html",
          response.clone()
        );

      }

      return response;

    } catch (err) {

      const cache = await caches.open(CACHE_NAME);

      const fallback =
        await cache.match("./index.html");

      if (fallback) return fallback;

      throw err;

    }

  })());

});
