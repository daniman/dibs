
gmaps = {
	//The map object
	map:null,

	//The google marker objects
	markers: [],

	//Google lat and long objects
	latLngs: [],

	//Formatted marker data objects
	markerData: [],

	// There is only one instance of Infowindow that get moved from marker to marker
	infowindow: null,

	//add a marker with formatted marker data
	addMarker: function(marker) {
		var gLatLng = new google.maps.LatLng(marker.lat, marker.lng);
		var gMarker = new google.maps.Marker({
			position: gLatLng,
			map: this.map,
			title: marker.title,
			icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		});
		
		infowindow = new google.maps.InfoWindow({
			width: 300,
			height: 300
		});
		
		//set the marker color according to time
		var currentTime = new Date();
		var thisTime = new Date(marker.postTime*1000);  
		var timeDifference = currentTime.getTime() - thisTime.getTime();
		var days = Math.floor(timeDifference / 86400000);
		
		//console.log('DAYS: '+days);
		var maxDays = 3;

		var R = Math.round((255*days)/maxDays);
		var G = Math.round((255*(maxDays-days))/maxDays);
		var B = Math.round(0);


		function componentToHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r,g,b) {
			return componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		// console.log(rgbToHex(R,G,B));
		// gMarker.setIcon('http://www.googlemapsmarkers.com/v1/' + rgbToHex(R,G,B));
		
		this.latLngs.push(gLatLng);
		this.markers.push(gMarker);
		this.markerData.push(marker);
		
		google.maps.event.addListener(gMarker, 'click', function() {
			this.map.panTo(gMarker.getPosition());
			var date =  new Date(marker.postTime*1000);
			infowindow.setContent("<strong>" + marker.title + "</strong>" + "<p> By:" + marker.author + " at " + date.toUTCString() + "</p>"+"<p>" + marker.content + "</p>");
			infowindow.open(this.map,gMarker);
		});

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
	initialize: function(mapOptions, mapStyles) {
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

		this.map = new google.maps.Map(
			document.getElementById('map-canvas'),
			mapOptions
		);

		//A click listener to create a reuse listing
		google.maps.event.addListener(this.map, 'click', function(event) {
		    var tempMarker = new google.maps.Marker({
				position: event.latLng,
				map: this.map,
				icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
				title: "New Post!"
		    })
			infowindow.setContent(
				'<form id="newItemForm">Post a new thing on dibs!' + 
                '<br><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
                '<br><input type="text" id="newItemDescription" name="description" placeholder="Description">' + 
                '<br><input id="submitNewItem" type="submit" value="Post!" />' + 
                '</form>'
            );
			infowindow.open(this.map,tempMarker);
		});
		

		// A global flag to say we are done with init
		Session.set('map', true);
	}
}