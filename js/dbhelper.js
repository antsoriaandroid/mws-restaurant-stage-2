/**
 * Common database helper functions.
 */
const DB_NAME = 'restaurantsDB';
const DB_TABLE_NAME = 'restaurant-details';
const DB_REVIEW_TABLE_NAME = 'reviews';

class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants/`;
    }

    static get REVIEWS_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/reviews/`;
    }

    /*Method to open an IDB*/
    static openIDB() {
        // Check service worker support, if it is not supported I don't do anything
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }
        console.log('Opening IDB');
        return idb.open(DB_NAME, 1, upgradeDb => {
            let store = upgradeDb.createObjectStore(DB_TABLE_NAME, {
                keyPath: 'id'
            });
            store.createIndex('by-id', 'id');

            let reviewStore = upgradeDb.createObjectStore(DB_REVIEW_TABLE_NAME, {
                keyPath: 'id'
            });
            //reviewStore.createIndex('by-id', 'id');
			reviewStore.createIndex('restaurant', 'restaurant_id');
        });
    }

    /*Method to insert in an IDB*/
    static insertIDB(data) {
        return DBHelper.openIDB().then(function (db) {
            if (!db) {
                return;
            }

            let tx = db.transaction(DB_TABLE_NAME, 'readwrite');
            let store = tx.objectStore(DB_TABLE_NAME);
            // data.forEach(function (restaurant) {
            console.log('Inserting in IDB: ' + data);
            store.put(data);
            // });

            return tx.complete;
        });
    }

    static updateFavouriteStatusIDB(restaurantId, isFavourite) {
		console.log('Favourite flag for restaurant '+restaurantId+ " changed to:" +isFavourite);	
        fetch(DBHelper.DATABASE_URL+`${restaurantId}/?is_favorite=${isFavourite}`, { method: 'PUT' })
		.then(response=>response.json())
        .then((data) => {
                DBHelper.openIDB()
                    .then( db => {
                        let tx = db.transaction(DB_TABLE_NAME, 'readwrite');
                        let restaurantsStore = tx.objectStore(DB_TABLE_NAME);
                        restaurantsStore.get(restaurantId)
                            .then(restaurant => {
								console.log();
                                restaurant.is_favorite = isFavourite;
                                restaurantsStore.put(restaurant);
                            });
							console.log(`Restaurant ${restaurantId} was updated`);
						return tx.complete;
                    })
        }).catch(error=> console.log(`Error updating Favourite IDB${error}`));

    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        DBHelper.openIDB().then(function (db) {
            if (!db) return;

            let tx = db.transaction(DB_TABLE_NAME, 'readwrite');
            let store = tx.objectStore(DB_TABLE_NAME);

            store.getAll().then(function (items) {
                // IDB is empty
                    if (items.length < 1) {
                        fetch(DBHelper.DATABASE_URL)
                            .then(response=>response.json())
                            .then (restaurants=> {
                                console.log('values ' + restaurants);
                                restaurants.forEach(restaurant => {
                                    DBHelper.insertIDB(restaurant);
                                });
                            });
                } else {
                    callback(null, items);
                }
            })
        })
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        //return (`./img/${restaurant.photograph}.jpg`);
		//Quick fix to solve problem with restaurant number 10		
		if(!restaurant.photograph) restaurant.photograph = 10;
		
		return (`./img/${restaurant.photograph}.webp`);
    }

    /**
     * Map marker for a restaurant Google Maps version.
     */
    /*static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }*/
	
	/**
     * Map marker for a restaurant MapBox Maps version.
     */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 


    static saveReviewToIDB(reviewsToSave) {
        return DBHelper.openIDB().then(function (db) {
            if (!db) return;

            let tx = db.transaction(DB_REVIEW_TABLE_NAME, 'readwrite');
            let store = tx.objectStore(DB_REVIEW_TABLE_NAME);
            store.put(reviewsToSave);

            return tx.complete;
        });
    }

    static addReview(review) {		
		let offline_obj = {
			  name: 'addReview',
			  data: review,
			  object_type: 'review'
		};
			
		// Check if online
		if (!navigator.onLine && (offline_obj.name === 'addReview')) {
			DBHelper.sendDataWhenOnline(offline_obj);
		  return;
		}

		console.log('Sending review: ', review);
		var fetch_options = {
		  method: 'POST',
		  body: JSON.stringify(review),
		  headers: new Headers({
			'Content-Type': 'application/json'
		  })
		};
		fetch(`http://localhost:1337/reviews`, fetch_options).then((response) => {
		  const contentType = response.headers.get('content-type');
		  if (contentType && contentType.indexOf('application/json') !== -1) {
			return response.json();
		  } else { return 'API call successfull'}})
		.then((data) => {
						DBHelper.fetchReviewsByRestaurantId(review.restaurant_id);
						console.log(`Fetch successful!`)})
		.catch(error => console.log('error:', error));
	
			
    }
	
	static sendDataWhenOnline(offline_obj) {
		console.log('Offline OBJ', offline_obj);
		localStorage.setItem('data', JSON.stringify(offline_obj.data));
		console.log(`Local Storage: ${offline_obj.object_type} stored`);
		window.addEventListener('online', (event) => {
		  console.log('Browser: Online again!');
		  let data = JSON.parse(localStorage.getItem('data'));
		  console.log('updating and cleaning ui');
		  [...document.querySelectorAll(".reviews_offline")]
		  .forEach(el => {
			el.classList.remove("reviews_offline")
			el.querySelector(".offline_label").remove()
		  });
		  if (data !== null) {
			console.log(data);
			if (offline_obj.name === 'addReview') {
			  DBHelper.addReview(offline_obj.data);
			}

			console.log('LocalState: data sent to api');

			localStorage.removeItem('data');
			console.log(`Local Storage: ${offline_obj.object_type} removed`);
		  }
		});
	  }

    static updateRestaurantStoreReview(data, name, rating, comments, restaurant_id) {
        return fetch(DBHelper.REVIEWS_URL + `?restaurant_id=${restaurant_id}`)
            .then(function (response) {
                return response.json();
            }).then(reviews => {
                reviews.forEach(function (review) {
                    DBHelper.saveReviewToIDB(review);
                });
                return reviews;
            });
    }

    static fetchReviewsByRestaurantId(restaurant_id) {
        return fetch(DBHelper.REVIEWS_URL + `?restaurant_id=${restaurant_id}`)
            .then(function (response) {
                return response.json();
            }).then(reviews => {
				console.log(`Reviews: ${reviews}`);
                reviews.forEach(function (review) {
                    DBHelper.saveReviewToIDB(review);
                });

                return Promise.resolve(reviews);
            }).catch(error => {
				console.log('Offline mode. Retrieving Review from DB');
				return DBHelper.retrieveReviews(restaurant_id).then((storedReviews) => {
					console.log('Loaded offline reviews');
					return Promise.resolve(storedReviews);
          })
      });
    }
	
	static retrieveReviews(restaurant_id) {
        return DBHelper.openIDB().then(function (db) {
            if (!db) {
                return;
            }

            let tx = db.transaction(DB_REVIEW_TABLE_NAME);
            let store = tx.objectStore(DB_REVIEW_TABLE_NAME);
			let indexId = store.index('restaurant');
			return indexId.getAll(restaurant_id);
        });
    }
	

    static synchronizeReviews(event, form) {
        event.preventDefault();
        const review = {
            'restaurant_id': parseInt(form.id.value),
            'name': form.dname.value,
            'rating': parseInt(form.drating.value),
            'comments': form.review.value,
        };

        fetch(DBHelper.REVIEWS_URL, {
                                        method: 'PUT',
                                        body: JSON.stringify(review),
                                        headers: new Headers({
                                            'Content-Type': 'application/json'
                                        })
                                    })
    }
}