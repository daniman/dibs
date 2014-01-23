
gmaps = {
	//The map object
	map:null,

	//The google marker objects
	markers: [],

	//global associative array

	//Google lat and long objects
	//latLngs: [],

	//Formatted marker data objects
	//markerData: [],

	// There is only one instance of Infowindow that get moved from marker to marker
	infowindow: null,

	//add a marker with formatted marker data
	addMarkerFromPost: function(post) {
		var gLatLng = new google.maps.LatLng(post.latitude, post.longitude);
		var gMarker = new google.maps.Marker({
			_id: post._id,
			position: gLatLng,
			map: map,
			title: post.title,
			icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		});
		
		infowindow = new google.maps.InfoWindow({
			maxWidth: 400
		});

		//console.log(gMarker._id);
		
		///////////////////////////////////////
		//Change the marker color according to how old the post is 
		var currentTime = new Date();
		var thisTime = new Date(post.postTimeUnix*1000);  
		var timeDifference = currentTime.getTime() - thisTime.getTime();
		
		var days = Math.floor(timeDifference / 86400000);

		var maxDays = 3;
		
		var R = Math.round((255*days)/maxDays);
		var G = Math.round((255*(maxDays-days))/maxDays);
		var B = Math.round(0);
		
		//console.log('Before: '+R+':'+G);
		R = clamp(R,0,255);
		G = clamp(G,0,255);
		//console.log('After: '+R+':'+G);

		function clamp(value, minValue, maxValue){
			return Math.max(Math.min(value,maxValue), minValue);
		}


		function componentToHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r,g,b) {
			return componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		
		gMarker.setIcon('http://www.googlemapsmarkers.com/v1/' + rgbToHex(R,G,B));
		
		//////////////////////////////
		//this.latLngs.push(gLatLng);
		this.markers.push(gMarker);
		//this.markerData.push(marker);
		
		google.maps.event.addListener(gMarker, 'click', function() {
			map.panTo(gMarker.getPosition());
			// var date =  new Date(marker.postTimeUnix*1000);
			gmaps.setInfoWindowContent(gMarker);
			// infowindow.setContent("<p class='infowindowTitle'>" + post.title + "</p>" + 
			// 	"<p class='infowindowAuthorAndDate'> By:" + post.author + " on " + post.postDateTime + "</p>" +
			// 	"<p class='infowindowContent'>" + post.content + "</p>");
			// infowindow.open(map,gMarker);
		});

		return gMarker;
	},



	//calculate the bounding box from markers
	calcBounds: function() {
		var bounds = new google.maps.LatLngBounds();
		for (var i=0, latLngLength = this.latLngs.length; i<latLngLength; i++){
			bounds.extend(this.latLngs[i]);
		}
		map.fitBounds(bounds);
	},

	// check if a marker previously exists
	markerExists: function(key, val) {
		_.each(this.markers, function(storedMarker) {
			if (storedMarker[key] == val)
				return true;
		});
	},

	findMarkerById: function(id){
		//console.log(id);
		for (i=0;i< this.markers.length;i++){
			if(this.markers[i]._id === id){
				console.log('found');
				return this.markers[i];
			}
		}
		 //console.log('not found');
		 return null;
	},

	setFocusToMarker: function(marker) {
		map.panTo(marker.getPosition());
		console.log(marker._id);
				
		gmaps.setInfoWindowContent(marker);
	},

	setInfoWindowContent: function(marker) {
		console.log('setinfowindowcontent');
		console.log('marker._id:'+ marker._id);
		post = Posts.findOne({_id: marker._id});
		console.log(post);
		console.log("post.title"+post.title);
		infowindow.setContent("<p class='infowindowTitle'>" + post.title + "</p>" + 
			"<p class='infowindowAuthorAndDate'> By:" + post.author + " on " + post.postDateTime + "</p>" +
			"<p class='infowindowContent'>" + post.content + "</p>");
		infowindow.open(map,marker);
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

		map = new google.maps.Map(
			document.getElementById('map-canvas'),
			mapOptions
		);

		//A click listener to create a reuse listing
		google.maps.event.addListener(map, 'click', function(event) {

		    infowindow.setContent('<div id="newItemFormLabel">Post a new thing on Dibs!</div>' + 
		                '<form id="newItemForm"><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
		                '<br><textarea id="newItemDescription" name="description" placeholder="Enter a ' +
		                	'description of your item here." form="newItemForm"></textarea>' + 
		                '<br><input id="submitNewItem" type="submit" value="Post!" />' + 
		                '</form>');

		    var tempMarker = new google.maps.Marker({
		      position: event.latLng,
		      map: map,
		      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
		      title: "New Item!"
		    });

		    map.panTo(tempMarker.getPosition()); //centers the map on the new temp listing

		    google.maps.event.addListener(tempMarker, 'click', function() {
		    	infowindow.open(map, tempMarker);
		    });

		    google.maps.event.addListener(infowindow, 'domready', function() {
		      $("#newItemForm").submit(function(e) {
		      	e.preventDefault();
		        var title = $("#newItemTitle").val();
		        var description = $("#newItemDescription").val();

		        var post = {
			        latitude: event.latLng.lat(),
			        longitude: event.latLng.lng(),
			        title: title,
			        content: description,
			        author: "current user",
			        postDateTime: Date.now()
			    };

			    console.log(post);
			      
			    Posts.insert(post);

		        tempMarker.setMap(null);
		      });
		    });

		    infowindow.open(map, tempMarker);

		    google.maps.event.addListener(infowindow, 'closeclick', function() {
		    	tempMarker.setMap(null);
		    });

		});
		

		// A global flag to say we are done with init
		Session.set('map', true);
		//console.log('init done');
	}
}