// This function is run when the page renders on client's browser
Template.page.rendered = function() {

// START GOOGLE MAPS RELATED CODE /////////////////////////////////////////////////////////////////////////////////////

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
    //If the user denies geolocation display message
    if (errorFlag == true) {
      alert("Geolocation service failed. Centering map on default location.");
      initialLocation = defaultLocation;
    }else{
      // no browser support
      alert("Browser does not support Geolocation.");
      initialLocation = defaultLocation;
    }

    //sets map center to initial location
    map.setCenter(initialLocation);
  }

  function placeMarker(location) {
      //set marker properties
      var marker = new google.maps.Marker({
          position: location, 
          map: map,
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });
  }

  // To add the marker to the map, use the 'map' property
  var testLatLng = new google.maps.LatLng(42.358998,-71.093377);
  var marker = new google.maps.Marker({
    position: testLatLng,
    map: map,
    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    title:"Hello World!"
  });

  var contentString = '<p>Hello World!</p>';

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  google.maps.event.addListener(map, 'click', function(event) {
     placeMarker(event.latLng);
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.open(map,marker);
  });


  //Zoom in/out click listeners
  google.maps.event.addDomListener(zoomout, 'click', function() {
   var currentZoomLevel = map.getZoom();
   if(currentZoomLevel != 0){
     map.setZoom(currentZoomLevel - 1);}     
  });

  google.maps.event.addDomListener(zoomin, 'click', function() {
   var currentZoomLevel = map.getZoom();
   if(currentZoomLevel != 21){
     map.setZoom(currentZoomLevel + 1);}
  });
}

Session.set('map', true); // global flag saying we initialized already

// END GOOGLE MAPS RELATED CODE ///////////////////////////////////////////////////////////////////////////////////////

// START LOGIN RELATED CODE////////////////////////////////////////////////////////////////////////////////////////////

Template.login.events({ // code to be run when an event occurs in the 'login' template

  'submit #login-form' : function(e, t){ // when the user submits the login form
    e.preventDefault();

    var email = t.find('#login-email').value, password = t.find('#login-password').value; // retrieve the input field values
    
    Meteor.loginWithPassword(email, password, function(err){ // tell meteor to login with the given email/password combo
      if (err) { // if meteor cannot login, alert the user that their email/password combo must be incorrect
        $("#login-errorMessage").html("email/password incorrect");
        $("#login-password").val("");
      } else {
        // The user has been logged in.
      }
    });
    return false; 
  },

  'submit #register-form' : function(e, t) { // when the user submits request to create a new account
    e.preventDefault();
    var email = t.find('#account-email').value, password = t.find('#account-password').value;

    // trim helper
    var trimInput = function(val) {
      return val.replace(/^\s*|\s*$/g, "");
    }
    var email = trimInput(email); // trim email

    var isValidPassword = function(val) { // specifies that a user's password must be more than six characters
      return val.length >= 6; 
    }

    if ($("#account-email").val() === "") { // if the user tries to submit w/o entering an email
      console.log("no email");
      $("#register-errorMessage").html("please enter an email");
    } else if ($("#account-password").val() === "") { // if the user tries to submit w/o entering a password
      $("#register-errorMessage").html("please enter a password");
    } else if ($("#account-password").val() !== $("#account-confirm-password").val()) { // if the user's two passwords don't match
      $("#register-errorMessage").html("passwords don't match");
    } else { // user has filled out all the inputs
      if (isValidPassword(password)) {
        Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            $("#register-errorMessage").html("account already exists"); // inform the user that account creation failed
          } else {
            // success - account has been created and the user has logged in successfully
          }
        });
      } else { // the user has not submitted a strong enough password (less than 6 chars)
        $("#register-errorMessage").html("password must be at least 6 chars");
      }
    }

    return false;
  }
});

Template.accordion.events({ // code to be run when events occur in the 'logout' template
  'click #logout' : function(e, t){ // when the user requests a logout
    Meteor.logout(function(){ }); // tell meteor to logout the user
    return false; 
  }
});

// allows easy access of username from within html handlebars
Template.accordion.displayName = displayName; // referring to helper funtion displayName() in login.js 


  

// END LOGIN RELATED CODE ///////////////////////////////////////////////////////////////////////////////////////////



// Retrieve an array of markers from the Database
function getMarkers(){
 var markers = [];
 
 return markers;
}
