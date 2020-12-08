// I fucking hate this so much, that we have to use JS and put it in a separate folder separate to the build
// TODO: fix

// Copied from https://stackoverflow.com/questions/54619653/can-a-service-worker-fetch-and-cache-cross-origin-assets
addEventListener('fetch', (e) => {
    fe.respondWith((async function() {
        const cachedResponse = await caches.match(fe.request);
        if (cachedResponse) {
          return cachedResponse;
        }
      
        const networkResponse = await fetch(fe.request);
      
        const hosts = [
          'https://gleitz.github.io/midi-js-soundfonts/',
        ];
      
        if (hosts.some((host) => fe.request.url.startsWith(host))) {
          // This clone() happens before `return networkResponse` 
          const clonedResponse = networkResponse.clone();
      
          fe.waitUntil((async function() {
            const cache = await caches.open(CACHE_NAME);
            // This will be called after `return networkResponse`
            // so make sure you already have the clone!
            await cache.put(fe.request, clonedResponse);
          })());
        }
      
        return networkResponse;
      })());
})


    