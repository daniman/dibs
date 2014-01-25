
gmaps = {
	//The map object
	map:null,

	//The google marker objects
	markers: [],

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
		
		// var days = Math.floor(timeDifference / 86400000);

		var maxDays = 3;
		var maxSeconds = maxDays*86400000;
		
		// var R = Math.round((255*days)/maxDays);
		// var G = Math.round((255*(maxDays-days))/maxDays);
		// var B = Math.round(0);
		
		// //console.log('Before: '+R+':'+G);
		// R = clamp(R,0,255);
		// G = clamp(G,0,255);
		// //console.log('After: '+R+':'+G);

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
		function HSVtoRGB(h, s, v) {
		    var r, g, b, i, f, p, q, t;
		    if (h && s === undefined && v === undefined) {
		        s = h.s, v = h.v, h = h.h;
		    }
		    i = Math.floor(h * 6);
		    f = h * 6 - i;
		    p = v * (1 - s);
		    q = v * (1 - f * s);
		    t = v * (1 - (1 - f) * s);
		    switch (i % 6) {
		        case 0: r = v, g = t, b = p; break;
		        case 1: r = q, g = v, b = p; break;
		        case 2: r = p, g = v, b = t; break;
		        case 3: r = p, g = q, b = v; break;
		        case 4: r = t, g = p, b = v; break;
		        case 5: r = v, g = p, b = q; break;
		    }
		    return {
		        r: Math.floor(r * 255),
		        g: Math.floor(g * 255),
		        b: Math.floor(b * 255)
		    };
		}
	

	    var h = Math.floor(clamp((maxSeconds - timeDifference),0,maxSeconds) * 120 / maxSeconds); 
	    
	    var rgb = HSVtoRGB(h/360, 1, 1);
		
		gMarker.setIcon('http://www.googlemapsmarkers.com/v1/' + rgbToHex(rgb.r,rgb.g,rgb.b));//hsv2rgb(h, 1, 1));
		
		this.markers.push(gMarker);
		
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
			"</p>" + "<p class='infowindowItemLocation'>Location: " + post.itemLocationGeneral + "-" + 
			post.itemLocationSpecific + "</p>" +"<p class='infowindowContent'>" + post.content + "</p>");
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
		    			'<div id="newPostError"></div>' +
		                '<form id="newItemForm"><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
		                '<br><span id="locationLabel">Location:</span><input id="newItemLocationGeneral" type="text" name="locationGeneral" placeholder="Building">' +
		                '<input id="newItemLocationSpecific" type="text" name="locationSpecific" placeholder="Room/Floor/Etc.">' +
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
		        var locationGeneral = $("#newItemLocationGeneral").val();
		        var locationSpecific = $("#newItemLocationSpecific").val();
		        var d = new Date();

		        if (title !== "") {
		        	if (locationGeneral !== "") {
		        		if (locationSpecific !== "") {
			        		if (description !== "") {
			        			var post = {
						        	posterId: null,
							        latitude: event.latLng.lat(),
							        longitude: event.latLng.lng(),
							        title: title,
							        content: description,
							        author: Template.accordion.displayName(),
							        postTimeUnix: Date.now(),
							        postDateTime: formatDate(d.toUTCString()),
							        itemLocationGeneral: locationGeneral,
							        itemLocationSpecific: locationSpecific
							    };
							    Posts.insert(post);
						        tempMarker.setMap(null);
			        		} else {
			        			$("#newPostError").html("Please enter a description.");
			        		}
		        		} else {
		        			$("#newPostError").html("Please enter a more specic location (room, floor, etc).");
		        		}
		        	} else {
		        		$("#newPostError").html("Please enter a general location (building, field, etc).");
		        	}
		        } else {
		        	$("#newPostError").html("Please enter a title.");
		        }

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
	var date = new Date(utcDate);
	tmpDate = date + "";
	tmpDate = tmpDate.slice(0, 21);
	console.log(tmpDate.charAt(tmpDate.length-3));
	if (tmpDate.charAt(tmpDate.length-3) == ":") {
		return tmpDate
	} else {
		return date.toUTCString();
	}
}