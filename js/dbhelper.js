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
    const isDevModeOn = false;
    let url=`http://localhost:${port}/`;
    if(isDevModeOn){
      url=window.location;
    }
    url+=`restaurants`;
     // return `http://localhost:${port}/data/restaurants.json`;
    return url;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
      return DBHelper.getCachedRestaurants().then(restaurants => {
          if(restaurants.length) {
              return Promise.resolve(restaurants);
          } else {
              return DBHelper.fetchRestaurantsFromAPI();
          }
      }).then(restaurants=> {
          callback(null, restaurants);
      }).catch(error => {
          callback(error, null);
      });
  }

  static fetchRestaurantsFromIDB(callback) {
      const dbPromise = idb.open(DB_NAME, 1, upgradeDB => {
          console.log('making a new object store');
          if( !upgradeDB.objectStoreNames.contains(DB_TABLE_NAME) )
          {
              upgradeDB.createObjectStore(DB_TABLE_NAME, {
                  keyPath: 'id',
                  autoIncrement : true
              });
              var store = upgradeDB.transaction.objectStore(DB_TABLE_NAME);
              store.createIndex('by-id', 'id');
          }
      });

      dbPromise.then( function(db) {
          if( !db ){
              DBHelper. fetchRestaurantsFromJSON(callback)
          }
          else{
              //get the data from the indexedDB
              // console.log('get from database');
              var restaurantsJSON = [];
              var tx = db.transaction(DB_TABLE_NAME);
              var store = tx.objectStore(DB_TABLE_NAME);
              store.getAll()
                  .then(function(results){
                      callback(null, results);
                      // console.log(results);
                  });
              tx.complete;
          }
      } );
  }

  static fetchRestaurantsFromJSON(callback){
      console.log("Fetching data from server");
      let xhr = new XMLHttpRequest();
      xhr.open('GET', DBHelper.DATABASE_URL);
      xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
              const json = JSON.parse(xhr.responseText);
              const restaurants = json.restaurants;
              callback(null, restaurants);
          } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${xhr.status}`);
              callback(error, null);
          }
      };
      xhr.send();
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
        let results = restaurants;
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
  static fetchNeighborhoods(callback){
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
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
   */urlForRestaurant
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}`);
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
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
