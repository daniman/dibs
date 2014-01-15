// This function is run when the page renders on client's browser
Template.page.rendered = function() {

  $("#login-holder").hide();

  // Geolocation Vars for setting up map and default position.
  var initialLocation;
  var defaultLocation = new google.maps.LatLng (42.357,-71.09); // the lat/long of a default location. Set to central campus at MIT
  var browserSupportFlag = new Boolean(); // A flag to keep track if the clients browser supports geolocation

  // Map options for the Google Map
  var mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        disableDoubleClickZoom: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false
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
  console.log(contentString);

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  google.maps.event.addListener(map, 'dblclick', function(event) {
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

Template.login.events({
  'click #createNewAccountButton' : function() {
    $("#login-holder").hide();
    $("#register-holder").show();
    $("#account-email").val($("#login-email").val());
    $("#account-password").val($("#login-password").val());
  },
  'submit #login-form' : function(e, t){
    e.preventDefault();
    console.log(Meteor.user());
    // retrieve the input field values
    var email = t.find('#login-email').value, password = t.find('#login-password').value;
    Meteor.loginWithPassword(email, password, function(err){ 
      if (err) {
        $("#login-errorMessage").html("email/password incorrect");
      } else {
        // The user has been logged in.
      }
    });
    return false; 
  }
});

Template.accordion.events({
  'click #logout' : function(e, t){
    Meteor.logout(function(){ });
    return false; 
  }
});

Template.accordion.displayName = displayName;

Template.register.events({
  'click #logInButton' : function() {
    $("#login-holder").show();
    $("#register-holder").hide();
    $("#login-email").val($("#account-email").val());
    $("#login-password").val($("#account-password").val());
  },
  'submit #register-form' : function(e, t) {
    e.preventDefault();
    var email = t.find('#account-email').value, password = t.find('#account-password').value;

    // trim helper
    var trimInput = function(val) {
      return val.replace(/^\s*|\s*$/g, "");
    }
    var email = trimInput(email);

    var isValidPassword = function(val) {
      return val.length >= 6; 
    }

    if ($("#account-email").val() === "") {
      $("#register-errorMessage").html("please enter an email");
    } else if ($("#account-password").val() === "") {
      $("#register-errorMessage").html("please enter a password");
    } else if ($("#account-password").val() !== $("#account-confirm-password").val()) {
      $("#register-errorMessage").html("passwords don't match");
    } else {
      if (isValidPassword(password)) {
        Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            // Inform the user that account creation failed
            $("#register-errorMessage").html("account already exists");
          } else {
            // Success. Account has been created and the user
            // has logged in successfully.
            console.log("new account successfully made");
          }
        });
      } else {
        $("#register-errorMessage").html("password must be at least 6 chars");
      }
    }

    return false;
  }

});