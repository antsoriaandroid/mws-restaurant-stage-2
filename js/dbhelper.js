/**
 * Common database helper functions.
 */
const DB_NAME = 'restaurantsDB';
const DB_TABLE_NAME = 'restaurant-details';

class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants/`;
    }

    /*Method to open an IDB*/
    static openIDB() {
        // Check service worker support, if it is not supported I don't do anything
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }
        console.log('Opening IDB');
        return idb.open(DB_NAME, 1, upgradeDb => {
            var store = upgradeDb.createObjectStore(DB_TABLE_NAME, {
                keyPath: 'id'
            });
            store.createIndex('by-id', 'id');
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
                console.log('Inserting in IDB: '+data);
                store.put(data);
           // });

            return tx.complete;
        });
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

                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', DBHelper.DATABASE_URL);
                    xhr.onload = () => {
                        if (xhr.status === 200) { // Got a success response from server!
                            const restaurants = JSON.parse(xhr.responseText);
                            console.log('values '+restaurants);
                            //DBHelper.insertIDB(restaurants);
                            restaurants.forEach(function (restaurant) {
                                DBHelper.insertIDB(restaurant);
                            });
                            callback(null, restaurants);
                        } else { // Oops!. Got an error from server.
                            const error = (`Request failed. Returned status of ${xhr.status}`);
                            callback(error, null);
                        }
                    }
                    xhr.send();

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
       // return DBHelper.DATABASE_URL+restaurant.id;
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`./img/${restaurant.photograph}.jpg`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }

}