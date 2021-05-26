const staticCache = 'site-static-v1';
const dynamicCache = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/pages/fallback.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
]

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    })
  })
};

// Install service worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCache).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets)    
    })
  );
});

// activate service worker
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCache && key !== dynamicCache)
        .map(key => caches.delete(key))
      )
    })
  );
});

// fetch handler
self.addEventListener('fetch', evt => {
  if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCache).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            limitCacheSize(dynamicCache, 15);
            return fetchRes; 
          })
        });
      }).catch(() => {
        if (evt.request.url.indexOf('.html') > -1) {
          return caches.match('/pages/fallback.html');
        }
      })
    );
  }
});