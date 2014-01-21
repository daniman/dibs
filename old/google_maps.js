gmaps = {
	//The map object
	map: null,

	//The google marker objects
	markers: [],

	//Google lat and long objects
	latLngs: [],

	//Formatted marker data objects
	markerData: [],

	//add a marker with formatted marker data
	addMarker: function(marker) {
		var gLatLng = new google.maps.LatLng(marker.lat, marker.lng);
		var gMarker = new google.maps.Marker({
			position: gLatLng,
			map: this.map,
			title: marker.title,
			icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		});
		this.latLngs.push(gLatLng);
		this.markers.push(gMarker);
		this.markerData.push(marker);
		return gMarker;
	},
	//calculate the bounding box from markers
	calcBounds: function() {
		var bounds = new google.maps.LatLngBounds();
		for (var i=0, latLngLength = this.latLngs.length; i<latLngLength; i++){
			bounds.extend(this.latLngs[i]);
		}
		this.map.fitBounds(bounds);
	},

	// check if a marker previously exists
	markerExists: function(key, val) {
		_.each(this.markers, function(storedMarker) {
			if (storedMarker[key] == val)
				return true;
		});
	},

	//init map
	initialize: function() {
		console.log('[+] Initializing Google Maps...');
		var clientLat = null;
		var clientLng = null;
		function getLocation()
		  {
		  if (navigator.geolocation)
		    {
		    navigator.geolocation.getCurrentPosition(showPosition);
		    }
		  else{clientLocation.innerHTML="Geolocation is not supported by this browser.";}
		  }
		function showPosition(position)
		  {
		  clientLat = position.coords.latitude;
		  clientLng = position.coords.longitude; 
		  }
		var mapOptions = {
			zoom:12,
			center: new google.maps.LatLng(clientLat,clientLng),
			mapTypeId: google.maps.mapTypeId.HYBRID
		};

		this.map = new google.maps.Map(
			document.getElementById('map-canvas'),
			mapOptions
		);

		// A global flag to say we are done with init
		Session.set('map', true);
	}
}
