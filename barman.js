const CACHE = "static";
const urlsToCache = ["./", "./index.html", "./icon.svg", "./manifest.json"];

/********************************/
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.keys()
        .then(cacheNames => {
            if(!cacheNames.includes(CACHE))
            return caches.open(CACHE).then(cache => cache.addAll(urlsToCache));
        })
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys(CACHE)
        .then(cacheNames => Promise.all(
            cacheNames.map(cache => {
                if(cache !== CACHE)
                return caches.delete(cache);
            })
        ))
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith((async () => {
        if(e.request.url.endsWith(".addon.js"))
            return await caches.open(CACHE).then(cache => cache.match(e.request));
            
        return await responseFirstWeb(e.request);
    })());
});

/********************************/
async function responseFirstCache(request) {
    const cache = await caches.open(CACHE);
    let response = await cache.match(request);
    if(!response) {
        response = await fetch(request).catch(e => null);
        if(response) cache.put(request, response.clone());
    }
    return response;
}

async function responseFirstWeb(request) {
    const cache = await caches.open(CACHE);
    let response = await fetch(request).catch(e => null);
    
    if(response) cache.put(request, response.clone());
    else response = await cache.match(request);
    
    return response;
}