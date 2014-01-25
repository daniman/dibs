// This function is run when the page renders on client's browser
Template.map.rendered = function() {// Geolocation Vars for setting up map and default position.

    $("#changePasswordPopup").hide();
    setTimeout(function() {
        document.getElementById("toggle").checked = false;
        document.getElementById("ac-2").checked = true;
    }, 2000);

  var initialLocation;
	var defaultLocation = new google.maps.LatLng (42.36,-71.09); // the lat/long of a default location. Set to central campus at MIT
	var browserSupportFlag = new Boolean(); // A flag to keep track if the clients browser supports geolocation

	// Map options for the Google Map
	var myStyles = [
	  {
	      featureType: 'poi',
	      elementType: 'labels',
	      stylers: [
	        {visibility: 'off'}
	      ] 
	    },{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]
	  // ];
   //    {"featureType":"poi","stylers":[{"visibility":"simplified"}]}

	window.mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        disableDoubleClickZoom: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        center: defaultLocation,
        styles: myStyles
    };

  gmaps.initialize(mapOptions);

    // var cursorMarker = Posts.find();
    // cursorMarker.observeChanges({
    //   added: function(id, fields){
    //     var post = {
    //       lat: fields.latitude,
    //       lng: fields.longitude,
    //       title: fields.title,
    //       content:fields.content,
    //       author: fields.author,
    //       postTime: fields.postTime
    //     };
        
    //     gmaps.addMarker(post);

    //   },
    //   removed: function(id) {
    //     //marker.setMap(null);
    //   }
    // });

  Deps.autorun(function() {
    var posts = Posts.find().fetch();
 
    _.each(posts, function(post) {
      if (typeof post.title !== 'undefined' &&
        typeof post.content !== 'undefined' &&
        typeof post.latitude !== 'undefined' &&
        typeof post.longitude !== 'undefined') {

        // check if marker already exists
        if (!gmaps.markerExists('_id', post._id)) {
            //console.log('data used');
            gmaps.addMarkerFromPost(post,post._id);
        }
      }
    });

  });

}