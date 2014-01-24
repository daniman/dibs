
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

	tempMarker:null,

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
		
		///////////////////////////////////////
		//Change the marker color according to how old the post is 
		var currentTime = new Date();
		var thisTime = new Date(post.postTimeUnix*1000);  
		var timeDifference = currentTime.getTime() - thisTime.getTime();
		
		var days = Math.floor(timeDifference / 86400000);

		var maxDays = 3;
		var maxSeconds = maxDays*86400000;
		
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

		//	Convert Hue Saturation Value Model to RGB Model
		//	Takes three separate values for Hue, Saturation, and Value
		//	Returns an array of [R,G,B]
		var hsv2rgb = function(h, s, v) {
			//	A formula from Wikipedia 
			//	http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
			var chroma = v*s;
			var huePrime = h/60;
			var x = chroma(1-Math.abs(huePrime%2-1));

			var rgb = [null,null,null];
			if (h === undefined){
				rgb = [0,0,0];
			}else if(huePrime <= 1){
				rgb = [chroma,x,0];
			}else if(huePrime <= 2){
				rgb = [x,chroma,0];
			}else if(huePrime <= 3){
				rgb = [0,chroma,x];
			}else if(huePrime <= 4){
				rgb = [0,x,chroma];
			}else if(huePrime <= 5){
				rgb = [x,0,chroma];
			}else if(huePrime <= 6){
				rgb = [chroma,0,x];
			}

			var m = v-chroma;
			rgb = [rgb[0]+m,rgb[1]+m,rgb[2]+m];
			return rgb;
		}	

	    var h = clamp((maxSeconds - timeDifference),0,maxSeconds) * 120 / maxSeconds;		    
	    console.log (h);
	    //console.log(hsv2rgb(h, 1, 1));
		   
			

		
		gMarker.setIcon('http://www.googlemapsmarkers.com/v1/' + rgbToHex(R,G,B));//hsv2rgb(h, 1, 1));
		
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
		//console.log('setinfowindowcontent');
		//console.log('marker._id:'+ marker._id);
		post = Posts.findOne({_id: marker._id});
		//console.log(post);
		//console.log("post.title"+post.title);
		infowindow.setContent("<p class='infowindowTitle'>" + post.title + "</p>" + 
			"<p class='infowindowAuthorAndDate'> By: <a href='mailto:" + post.senderAddress +
			"?Subject=Re: " + post.title + "' target='_top'>" + post.author + "</a> on " + post.postDateTime +
			"</p>" + "<p class='infowindowContent'>" + post.content + "</p>");
		infowindow.open(map,marker);
	},

	setInfowindowForm: function (){

	},

	setCenterToUser: function() {

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

		// creates the infowindow once
		infowindow = new google.maps.InfoWindow({
			maxWidth: 400
		});

		//creates the temp marker once
		tempMarker = new google.maps.Marker({
		      map: null,
		      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
		      title: "New Post!"
		    });

		//A click listener to create a reuse listing
		google.maps.event.addListener(map, 'click', function(event) {
			console.log('map clicked');
		    infowindow.setContent('<div id="newItemFormLabel">Post a new thing on Dibs!</div>' + 
		                '<form id="newItemForm"><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
		                '<br><textarea id="newItemDescription" name="description" placeholder="Enter a ' +
		                	'description of your item here." form="newItemForm"></textarea>' + 
		                '<br><input id="submitNewItem" type="submit" value="Post!" />' + 
		                '</form>');

		     tempMarker.setPosition(event.latLng);
		     tempMarker.setMap(map);
		    

		    //console.log('marker created');

		    map.panTo(tempMarker.getPosition()); //centers the map on the new temp listing

		    //console.log('map centered');

		    google.maps.event.clearListeners(infowindow,'domready');

		    var infowindowHandler = google.maps.event.addListener(infowindow, 'domready', function() {
		      $("#newItemForm").submit(function(e) {
		      	e.preventDefault();
		        var title = $("#newItemTitle").val();
		        var description = $("#newItemDescription").val();
		        var d = new Date();

		        var post = {
			        latitude: event.latLng.lat(),
			        longitude: event.latLng.lng(),
			        title: title,
			        content: description,
			        author: Template.accordion.displayName(),
			        postTimeUnix: Date.now(),
			        postDateTime: formatDate(d.toUTCString())
			    };
			    console.log('post insert');
			    Posts.insert(post);
				console.log('remove marker');
		        tempMarker.setMap(null);
		      });
		    });

		    infowindow.open(map, tempMarker);

		    google.maps.event.clearListeners(infowindow,'closeclick');
		    google.maps.event.addListener(infowindow, 'closeclick', function() {
		    	console.log('close click');
		    	google.maps.event.clearListeners(infowindow,infowindowHandler);
		    	tempMarker.setMap(null);

		    });

		});
		

		// A global flag to say we are done with init
		Session.set('map', true);
		console.log('init done');
	}
}

formatDate = function(utcDate) {
	var tmpDate = new Date(utcDate);
	tmpDate = tmpDate + "";
	return tmpDate.slice(0, tmpDate.length-15);
}