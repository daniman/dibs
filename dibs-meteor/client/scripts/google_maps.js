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
			map: map,
			title: marker.title,
			icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
		});

		console.log(marker);

		var infoWindow = new google.maps.InfoWindow({
		    content: '<p>' + marker.title + '</p>' + 
                '<p>' + marker.content + '</p>'                
		});

		google.maps.event.addListener(gMarker, 'click', function() {
		    infoWindow.open(map,gMarker);
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
	initialize: function(mapOptions) {
		console.log('[+] Initializing Google Maps...');
		var clientLat = null;
		var clientLng = null;

		function getLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(showPosition);
			} else {
			  	clientLocation.innerHTML="Geolocation is not supported by this browser.";
			}
		}

		function showPosition(position) {
			clientLat = position.coords.latitude;
			clientLng = position.coords.longitude; 
		}

		map = new google.maps.Map(
			document.getElementById('map-canvas'),
			mapOptions
		);

		// A global flag to say we are done with init
		Session.set('map', true);

/** ------------------------------------------------------------------------------------------------------------- **/
		google.maps.event.addListener(map, 'click', function(event) {

			console.log("click!");

		    var infoWindow = new google.maps.InfoWindow({
		      content: '<form id="newItemForm">Post a new thing on dibs!' + 
		                '<br><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
		                '<br><input type="text" id="newItemDescription" name="description" placeholder="Description">' + 
		                '<br><input id="submitNewItem" type="submit" value="Post!" />' + 
		                '</form>'
		    });

		    var marker = new google.maps.Marker({
		      position: event.latLng,
		      map: map,
		      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
		      title: "New Item!"
		    })

		    google.maps.event.addListener(marker, 'click', function() {
		      infoWindow.open(map,marker);
		    });

		    google.maps.event.addListener(infoWindow, 'domready', function() {
		      $("#newItemForm").submit(function(e) {
		        var title = $("#newItemTitle").val();
		        var description = $("#newItemDescription").val();
		        console.log("meow");

		        var post = {
			        latitude: event.latLng.lat(),
			        longitude: event.latLng.lng(),
			        title: title,
			        content: description,
			        author: "current user",
			        postTime: Date.now()
			    };
			      
			    Posts.insert(post);

		        infoWindow.setContent("<p>" + title + "</p>" + "<p>" + description + "</p>");
		        e.preventDefault();

		        marker.setMap(null);
		      });
		    });

		    infoWindow.open(map, marker);

		});
/** ------------------------------------------------------------------------------------------------------------- **/

	}
}
