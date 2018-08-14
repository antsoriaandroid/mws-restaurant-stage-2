var staticCacheName = 'mws-restaurant';
let fileToCache = [
  'index.html',
  'restaurant.html',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  'sw.js',
  '/css/styles.css',
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
  '/img/1.webp',
  '/img/2.webp',
  '/img/3.webp',
  '/img/4.webp',
  '/img/5.webp',
  '/img/6.webp',
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
  '/img/undefined.webp',
  '/img/icons/icon_192x192.png',
  '/img/icons/icon_512x512.png',
  'favicon.ico',
  'manifest.json'
];

self.addEventListener('install', event => {
  console.log('service worker installed');
  /*event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('serviceWorker is caching app shell');
      return cache.addAll(fileToCache);
    })
  );*/

  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('serviceWorker is caching app shell');
      return cache.addAll([
	 '/', 
  '/index.html',
  '/restaurant.html',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/sw.js',
  '/css/styles.css',
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
  '/img/1.webp',
  '/img/2.webp',
  '/img/3.webp',
  '/img/4.webp',
  '/img/5.webp',
  '/img/6.webp',
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
  '/img/undefined.webp',
  '/img/icons/icon_192x192.png',
  '/img/icons/icon_512x512.png',
  '/favicon.ico',
  '/manifest.json'
  //,'https://maps.googleapis.com/maps/api/js?key=AIzaSyAeYGklucZIufse0mnqyOBmZlycsMnlTUQ&libraries=places&callback=initMap'
]);
    })
  );

});

self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-') && cacheName != staticCacheName;
        }).map(function(cacheName) {
			console.log("Cache deleted");
          return caches.delete(cacheName);
        })
      ).then(() => { console.log('Service worker active');} );
    })
  );
});


//self.addEventListener('fetch', event => {
/*	if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin'){  	  return event.respondWith(
		caches.match(event.request, { ignoreSearch: true }).then(response => {
		  if (response) return response;
		  return fetch(event.request);
		}).catch((error) => {
		  console.log(error);}
		)
);}
	else {
	  return event.respondWith(
		caches.match(event.request, { ignoreSearch: true }).then(response => {
		  if (response) return response;
		  return fetch(event.request);
		}).catch((error) => {
		  console.log(error);}
		)
);}*/
/*	if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {console.log('no va');return;}
	event.respondWith(caches.match(event.request)
	  .then(function(response) {
		  if (response) {
			return response;
		  }
		  return fetch(event.request);
		})
	  );

	  
	  
	  
	  
});*/
/*self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Try the cache
	//console.log("Loading cache content");
    caches.match(event.request).then(function(response) {
      // Fall back to network
	  console.log("Network loading content. Cache failed");
      return response || fetch(event.request);
    }).catch((error) => {
		  console.log("Neither cache nor network are available"+error);
    })
  );
});*/

//Code suggested by Udacity
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) { 
			console.log("Cache hit - return response");
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
			console.log("Check if we received a valid response");
            if(!response || response.status !== 200 || response.type !== 'basic') {
				console.log("Not 200");
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(staticCacheName)
              .then(function(cache) {
				  console.log("Caching reponse");
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('fetch', function(event) {
	if(event.request.url.startsWith(self.registration.scope))
	{
		// If the fetched resource comes from the same domain of the SW, I'll add it to the cache
		caches.open('restaurantReview').then(function(cache) {
			return cache.add(event.request.url);
		})
	}

	event.respondWith(
		caches.match(event.request).then(function(response) {
			// Get the requested element from the cache, or (if not found) fetch it from the network
			return response || fetch(event.request);
		})
		);
});


 /*   self.addEventListener('fetch', function (event) {
      var requestUrl = new URL(event.request.url);
    
      if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
          event.respondWith(caches.match('/'));
          return;
        }
      }
    
      event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      }));
    });

 /*   self.addEventListener('fetch', function (event) {
      var requestUrl = new URL(event.request.url);
    
      if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
          event.respondWith(caches.match('/'));
          return;
        }
      }
    
      event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      }));
    });*/

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
/*
self.addEventListener('sync', event => {
  if (event.tag === 'review-sync') {
    event.waitUntil(IDBHelper.syncOfflineReviews());
  }
});*/
