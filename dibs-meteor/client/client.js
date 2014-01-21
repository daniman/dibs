// This function is run when the page renders on client's browser
Template.page.rendered = function() {

  // Geolocation Vars for setting up map and default position.
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
  var mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        disableDoubleClickZoom: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        center: defaultLocation,
        styles: myStyles
      };

  //Create a new google map with the above options
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  //Attempt W3C Geolocation on browser
  if (navigator.geolocation){
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(initialLocation);
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    }); 
  }

  //browser does not support geolocation
  else{
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }

  //If the browser does not support geolocation or the user denies its use
  function handleNoGeolocation(errorFlag){
    if (errorFlag == true) { //If the user denies geolocation display message
      alert("Geolocation service failed. Centering map on default location.");
      initialLocation = defaultLocation;
    }else{ // no browser support
      alert("Browser does not support Geolocation.");
      initialLocation = defaultLocation;
    }
    map.setCenter(initialLocation); //sets map center to initial location
  }

//----------------------------------------------------------------------------------------------------------//

  // google.maps.event.addListener(map, 'click', function(event) {

  //   var infoWindow = new google.maps.InfoWindow({
  //     content: '<form id="newItemForm">Post a new thing on dibs!' + 
  //               '<br><input id="newItemTitle" type="text" name="title" placeholder="Title">' + 
  //               '<br><input type="text" id="newItemDescription" name="description" placeholder="Description">' + 
  //               '<br><input id="submitNewItem" type="submit" value="Post!" />' + 
  //               '</form>'
  //   });

  //   var marker = new google.maps.Marker({
  //     position: event.latLng,
  //     map: map,
  //     icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  //     title: "New Item!"
  //   })

  //   google.maps.event.addListener(marker, 'click', function() {
  //     infoWindow.open(map,marker);
  //   });

  //   google.maps.event.addListener(infoWindow, 'domready', function() {
  //     $("#newItemForm").submit(function(e) {
  //       var title = $("#newItemTitle").val();
  //       var description = $("#newItemDescription").val();
  //       console.log("meow");
  //       console.log($("#newItemTitle").val());
  //       console.log($("#newItemDescription").val());
  //       Items.insert({
  //         title: title,
  //         description: description
  //       });
  //       infoWindow.setContent("<p>" + title + "</p>" + "<p>" + description + "</p>");
  //       $("#postListContainer").prepend("<div class='post'><div class='title'>" + title + "</div><div class='description'>" + description + "</div></div>")
  //       e.preventDefault();
  //     });
  //   });

  //   infoWindow.open(map, marker);

  // });

}

//----------------------------------------------------------------------------------------------------------//

Session.set('map', true); // global flag saying we initialized already