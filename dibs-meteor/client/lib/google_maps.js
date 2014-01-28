
gmaps = {
	//The map object
	map:null,

	//The google marker objects
	markers: {},

	// There is only one instance of Infowindow that get moved from marker to marker
	infowindow: null,

	tempMarker:null,

	//add a marker with formatted marker data
	addMarkerFromPost: function(post) {
		console.log('add mark');
		var gLatLng = new google.maps.LatLng(post.latitude, post.longitude);
		var gMarker = new google.maps.Marker({
			_id: post._id,
			position: gLatLng,
			map: map,
			title: post.title,
			animation: google.maps.Animation.DROP,
			icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
			zIndex: google.maps.Marker.MAX_ZINDEX-gmaps.getNumberOfMarkers()
			
		});
		
		
		///////////////////////////////////////
		//Change the marker color according to how old the post is 
		var currentTime = new Date();
		var thisTime = new Date(post.postTimeUnix*1000);  
		var timeDifference = currentTime.getTime() - thisTime.getTime();

		var maxDays = 3;
		var maxSeconds = maxDays*86400000;
		

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
		
		this.markers[post._id] = gMarker;
		
		google.maps.event.addListener(gMarker, 'click', function() {

			console.log(post.uniqueViewersList);
			if (post.uniqueViewersList.indexOf(Meteor.userId()) == -1) { // if the user has not already viewed the post
				//console.log("woohoo");
				post.uniqueViewersList.push(Meteor.userId());
				post.uniqueViewers += 1;
			}
			//  else {
			// 	//console.log("already viewed");
			// }

			//console.log(Meteor.userId());
			//console.log(post);
			listmanager.setListFocus(post._id);
			gmaps.setFocusToMarker(gMarker);
		});

		return gMarker;
	},



	//calculate the bounding box from markers
	calcBounds: function() {
		var bounds = new google.maps.LatLngBounds();
		for (var i=0, latLngLength = gmaps.latLngs.length; i<latLngLength; i++){
			bounds.extend(gmaps.latLngs[i]);
		}
		map.fitBounds(bounds);
	},

	// check if a marker previously exists
	// markerExists: function(key, val) {
	// 	_.each(this.markers, function(storedMarker) {
	// 		if (storedMarker[key] == val)
	// 			return true;
	// 	});
	// },

	findMarkerById: function(id){
		if(id in this.markers){
			return this.markers[id];
		}else{
			return null;
		}

		// console.log('looking for'+id);
		// for (i=0;i< this.markers.length;i++){
		// 	console.log('trying'+this.markers[i]._id);
		// 	if(this.markers[i]._id === id){
		// 		console.log('found');
		// 		return this.markers[i];
		// 	}
		// }
		// console.log('not found');
		// return null;
	},

	setFocusToMarker: function(marker) {
		gmaps.stopAllAnimation();
		tempMarker.setMap(null);
		map.panTo(marker.getPosition());
		//marker.setAnimation(google.maps.Animation.BOUNCE);		
		gmaps.setInfoWindowContent(marker);
	},

	setInfoWindowContent: function(marker) {
		post = Posts.findOne({_id: marker._id});

		if (post.uniqueViewersList.indexOf(Meteor.userId()) == -1) { // if the user has not already viewed the post
			console.log("woohoo");
			Posts.update(
				{_id: post._id},
				{
					$push: {uniqueViewersList: Meteor.userId()},
					$inc: {uniqueViewers: 1}
				}
			)
		}

		var infoContent;
		if (post.itemLocationSpecific === '0'){
			infoContent = "<p class='infowindowTitle'>" + post.title + "</p>" + 
			"<p class='infowindowAuthorAndDate'> By: <a href='mailto:" + post.senderAddress +
			"?Subject=Re: " + post.title + "' target='_top'>" + post.author + "</a> on " + post.postDateTime +
			"</p>" + "<p class='infowindowLocation'>Location: " + post.itemLocationGeneral + "</p>" + "<p class='infowindowViewers'>Number of views: " + post.uniqueViewers + "</p>"
			+ " <p class='infowindowContent'>" + post.content + "</p>";
		}else{
			infoContent = "<p class='infowindowTitle'>" + post.title + "</p>" + 
			"<p class='infowindowAuthorAndDate'> By: <a href='mailto:" + post.senderAddress +
			"?Subject=Re: " + post.title + "' target='_top'>" + post.author + "</a> on " + post.postDateTime +
			"</p>" + "<p class='infowindowLocation'>Location: " + post.itemLocationGeneral + "-" + 

			post.itemLocationSpecific + "</p> " + "<p class='infowindowViewers'>Number of views: " + post.uniqueViewers + "</p>"
			+ " <p class='infowindowContent'>" + post.content + "</p>";
		}
		infowindow.setContent(infoContent);

		

		infowindow.open(map,marker);
		google.maps.event.addListener(infowindow, 'closeclick', function() {
			listmanager.clearListFormatting();
	    	gmaps.stopAllAnimation();
	    	tempMarker.setMap(null);
		});
		$('#newItemTitle').focus();
	},

	setInfowindowForm: function (){

	},

	setCenterToUser: function() {

	},

	getNumberOfMarkers: function(){
		return Object.keys(this.markers).length;
	},

	stopAllAnimation: function(){
		for(i=0;i<gmaps.markers.length;i++){
			gmaps.markers[i].setAnimation(null);
		}
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
			maxWidth: 400,
			disableAutoPan: false
		});

		//creates the temp marker once
		tempMarker = new google.maps.Marker({
		      map: null,
		      icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
		      title: "New Post!"
		    });

		//A click listener to create a reuse listing
		google.maps.event.addListener(map, 'click', function(event) {
			document.getElementById("alert").checked = true;
			gmaps.stopAllAnimation();
			listmanager.clearListFormatting();
		    infowindow.setContent('<div id="newItemFormLabel">Post a new thing on Dibs!</div>' + 
		    			'<div id="newPostError"></div>' +
		                '<form id="newItemForm"><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
		                '<br><span id="locationLabel">Location:</span><input id="newItemLocationGeneral" type="text" name="locationGeneral" placeholder="Building">' +
		                '<input id="newItemLocationSpecific" type="text" name="locationSpecific" placeholder="Room/Floor/Etc.">' +
		                '<br><textarea id="newItemDescription" name="description" placeholder="Enter a ' +
		                	'description of your item here." form="newItemForm"></textarea>' + 
		                '<br><input id="submitNewItem" type="submit" value="Post!" /><button id="cancelNewItem" type="button">Cancel</button>' + 
		                '</form>');

		    tempMarker.setPosition(event.latLng);
		    tempMarker.setMap(map);

		    map.panTo(tempMarker.getPosition()); //centers the map on the new temp listing

		    google.maps.event.clearListeners(infowindow,'domready');

		    var infowindowHandler = google.maps.event.addListener(infowindow, 'domready', function() {
		    	$("#cancelNewItem").click(function() {
		    		infowindow.close();
		    		tempMarker.setMap(null);
		    	});

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
						        	//posterId: Meteor.userId,
							        latitude: event.latLng.lat(),
							        longitude: event.latLng.lng(),
							        title: title,
							        content: description,
							        //author: Template.accordion.displayName(),
							        //postTimeUnix: Date.now()/1000,
							        //postDateTime: formatDate(d.toUTCString()),
							        itemLocationGeneral: locationGeneral,
							        itemLocationSpecific: locationSpecific
							    };

							    Meteor.call('post', post, function(error, id) {
							      if (error)
							        return alert(error.reason);
							    });
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
		    	google.maps.event.clearListeners(infowindow,infowindowHandler);
		    	gmaps.stopAllAnimation();
		    	tempMarker.setMap(null);
		    });

		});
		

		// A global flag to say we are done with init
		Session.set('map', true);
	}
}

