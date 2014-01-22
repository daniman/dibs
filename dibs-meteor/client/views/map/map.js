// This function is run when the page renders on client's browser
Template.map.rendered = function() {// Geolocation Vars for setting up map and default position.
	console.log("rendered");
  var initialLocation;
	var defaultLocation = new google.maps.LatLng (42.357,-71.09); // the lat/long of a default location. Set to central campus at MIT
	var browserSupportFlag = new Boolean(); // A flag to keep track if the clients browser supports geolocation

	// Map options for the Google Map
	var myStyles = [
	  {
	      featureType: 'poi',
	      elementType: 'labels',
	      stylers: [
	        {visibility: 'off'}
	      ] 
	    }
	  ];

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

    var cursorMarker = Posts.find();
    cursorMarker.observeChanges({
      added: function(id, fields){
        var post = {
          lat: fields.latitude,
          lng: fields.longitude,
          title: fields.title,
          content:fields.content,
          author: fields.author,
          postTime: fields.postTime
        };
        
        gmaps.addMarker(post);

      },
      removed: function(id) {
        //marker.setMap(null);
      }
    });
}