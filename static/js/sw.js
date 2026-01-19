const CACHE_NAME = "Learning-Journal-PWA-2304240";
const PRECACHE = [
    // don't cache HTML files, they are dynamic
    "/static/css/musicPlayer.css",
    "/static/css/theme.css",
    "/static/images/Hatsune-BW.png",
    "/static/images/Hatsune-BW2.png",
    "/static/images/Kawaii Art.gif",
    "/static/images/Kawaii Art.png",
    "/static/images/Miku.png",
    "/static/images/defaultIcon512.png",
    "/static/images/defaultIcon192.png",
    "/static/js/global.js",
    "/static/js/index.js",
    "/static/js/journalEdit.js",
    "/static/js/musicPlayer.js",
    "/static/js/pong.js",
];


// Install event → triggered when service worker is first installed
// Used to pre-cache essential files so app works offline
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME); // Open specified cache
        await cache.addAll(PRECACHE); // Add all pre-defined files to cache
    })());
});

// Activate event → triggered after install and when SW takes control
// Used to clean up old caches that are no longer needed
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys(); // Get all cache names
        // Delete any caches that are not the current one
        await Promise.all(
            keys
                .filter(key => key !== CACHE_NAME) // keep caches not current one
                .map(key => caches.delete(key)) // Delete old cache
        );
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const url = new URL(event.request.url);

        // Cache-first strategy for /static resources
        if (url.pathname.startsWith('/static')) {
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            } else {
                console.warn("Static Resource not pre-cached: ", event.request.url);
                try {
                    const fetchResponse = await fetch(event.request);
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                } catch (e) {
                    return new Response("Offline and no cached version available.", {
                        status: 503,
                        statusText: "Service Unavailable"
                    });
                }
            }
        } else {
            // Network-first strategy for dynamic content
            try {
                if (navigator.onLine === false) {
                    throw new Error("Offline");
                }

                const fetchResponse = await fetch(event.request);
                // Filter out Chrome extension requests
                if ((event.request.url.indexOf('http') === 0)) {
                    cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            } catch (e) {
                // Network failed, try cache
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                } else {
                    return new Response("Offline and no cached version available.", {
                        status: 503,
                        statusText: "Service Unavailable"
                    });
                }
            }
        }
    })());
});