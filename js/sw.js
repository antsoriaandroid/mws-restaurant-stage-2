const CACHE_NAME = 'MWS-RESTAURANT-CACHE-V1'
console.log("Service Worker startup");

//Installation of the Service Worker
self.addEventListener('install', function(event) {
    console.log("Service Worker installed");
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Service Worker opening cache");
            return cache.addAll([
                '/js/dbhelper.js',
                '/js/restaurant_info.js',
                '/js/main.js',
                '/css/styles.css',
                '/data/restaurants.json',
                '/index.html',
                '/restaurant.html',
                '/img/1.jpg',
                '/img/2.jpg',
                '/img/3.jpg',
                '/img/4.jpg',
                '/img/5.jpg',
                '/img/6.jpg',
                '/img/7.jpg',
                '/img/8.jpg',
                '/img/9.jpg',
                '/img/10.jpg',
				'/manifest.json'
            ]).catch(function (err){
                console.log("Error: Service worker install failed: ", err);
            });
        })
    );
});

//Activation of the Service Worker
self.addEventListener('activate', function(event){
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then(function(cache){
            return Promise.all(cache.map(function(currentCacheName){
                if (currentCacheName !== CACHE_NAME ) {
                    caches.delete(currentCacheName);
                }
            }))
        })
    )
});

//Fetch of the Service Worked
self.addEventListener('fetch', function(event) {
    console.log("Service Worker fetch");
    event.respondWith(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function (err) {
            console.log("Error: Service worker fetch failed: ", err);
        })
    );
});

self.addEventListener('sync', function(event) {alert();
  if (event.tag === 'SyncReviews') {
    event.waitUntil(DBHelper.synchronizeReviews(review));
  }
});
