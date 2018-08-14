let restaurant;
//Google maps version
//var map;

//Map box version
var newMap;

/**
 * Initialize Google map, called from HTML.
 */
/*window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};*/

/**
 * Initialize Mapbox map, called from HTML.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});
/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYXNvcmlhIiwiYSI6ImNqa3BhYmh3cTFydGczbG1nejV5NXlnN2kifQ.RY88mSvbnnqDvu_p5ue0MA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  //Fill favourite flag
  fillFavouriteHTML();

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.setAttribute('alt','Picture of restaurant ' + restaurant.name);
  /*image.srcset = "/img/" + restID + "-small.jpg 200w, /img/" + restID + "-medium.jpg 400w, /img/" + restID + ".jpg 1065w";
  image.sizes="(max-width: 640px) 280px, (max-width: 1007px) 800px";*/
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  //fillReviewsHTML();
  DBHelper.fetchReviewsByRestaurantId(restaurant.id)
      .then(reviews => fillReviewsHTML(reviews));
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


fillFavouriteHTML = (restaurant=reviews = self.restaurant) => {
	const favourite = document.getElementById('restaurant-favourite');

	const favouriteButton = document.createElement('button');
    favouriteButton.classList.add("favourite-button");
    if(restaurant.is_favorite){
        favouriteButton.innerHTML = 'I love it❤';
        favouriteButton.classList.add("favourite");
        favouriteButton.setAttribute('aria-label', 'Unmark as favourite restaurant');
    } else {
        favouriteButton.innerHTML = 'Not favourite';
        favouriteButton.classList.remove("favourite");
        favouriteButton.setAttribute('aria-label', 'Mark as favourite restaurant');
    }

    favouriteButton.onclick = function () {
        restaurant.is_favorite =  !restaurant.is_favorite;
        if(restaurant.is_favorite){
            favouriteButton.innerHTML = 'I love it❤';
            favouriteButton.classList.add("favourite");
            favouriteButton.setAttribute('aria-label', 'Unmark as favourite restaurant');
        } else {
            favouriteButton.innerHTML = 'Not favourite';
            favouriteButton.classList.remove("favourite");
            favouriteButton.setAttribute('aria-label', 'Mark as favourite restaurant');
        }
        DBHelper.updateFavouriteStatusIDB(restaurant.id, restaurant.is_favorite);

    };
    favourite.appendChild(favouriteButton);
}



/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) =>{
   // DBHelper.fetchReviewsByRestaurantId(restaurant_id)
        //.then(reviews => {
            const container = document.getElementById('reviews-container');
              if (!reviews) {
                const noReviews = document.createElement('p');
				noReviews.id="no-reviews";
                noReviews.innerHTML = 'No reviews yet!';
                container.appendChild(noReviews);
                return;
            }
            const ul = document.getElementById('reviews-list');
            reviews.forEach(review => {
                ul.appendChild(createReviewHTML(review));
            });
            container.appendChild(ul);
       // }
    //    )
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  //This date is not working date.innerHTML = review.date;
  date.innerHTML =  `Submitted on: ${new Date(review.createdAt).toLocaleString()}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function  addReview() {

    var name = document.getElementById('review-author-name').value;
    var rating = document.getElementById('review-rating').value;
    var comments = document.getElementById('review-comments').value;

    const restaurant_id = getParameterByName('id');
    console.log("Adding review with name \"" + name + "\" rating " + rating + " and comments \"" + comments + "\" for restaurant with id " + restaurant_id);

    let review = {
                restaurant_id: parseInt(restaurant_id),
                name: name,
                rating: parseInt(rating),
                comments: comments
                };


   /* fetch(DBHelper.REVIEWS_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
        .then(res => {
            res.json();
        })
        .catch(error => {
            console.error('Error:', error);
            //cacheAddReviewRequestInIndexedDbDatabase(url, data, restaurant_id);
        })
        .then(response => {
            console.log('Success:', response)
        });

    DBHelper.updateRestaurantStoreReview(data, name, rating, comments, restaurant_id);*/
	DBHelper.addReview(review);
	
	//Removing message about no reviews because one has being created.
	const container = document.getElementById('reviews-container');
	if (document.getElementById('no-review')) {
			document.getElementById('no-review').remove();
	}
	const ul = document.getElementById('reviews-list');
	ul.appendChild(createReviewHTML(review));
    container.appendChild(ul);
	
    document.getElementById('review-author-name').value="";
    document.getElementById('review-rating').value="";
    document.getElementById('review-comments').value="";
   // fillReviewsHTML();
}

