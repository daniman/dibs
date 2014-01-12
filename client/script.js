if (Meteor.isClient) {

  Template.page.rendered = function() {

    $("#login-holder").hide();
    var initialLocation;
    var mitCampus = new google.maps.LatLng (42.357,-71.09);
    var browserSupportFlag = new Boolean();

    var mapOptions = {
          zoom: 15,
          disableDefaultUI: true
        };
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    //Attempt W3C Geolocation
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

    function handleNoGeolocation(errorFlag){
      if (errorFlag == true) {
        alert("Geolocation service failed.");
        initialLocation = mitCampus;
      }else{
        alert("Browser does not support Geolocation.");
        initialLocation = mitCampus;
      }
      map.setCenter(initialLocation);
    }

    // To add the marker to the map, use the 'map' property
    var testLatLng = new google.maps.LatLng(42.369289,-71.118305);
    var marker = new google.maps.Marker({
      position: testLatLng,
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      title:"Hello World!"
    });


    var contentString = '<p>Congrats You have opened an infowindow.</p>';
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
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

  Template.logout.events({
    'submit #logout-form' : function(e, t){
      Meteor.logout(function(){ });
      return false; 
    }
  });

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

      if($("#account-password").val() !== $("#account-confirm-password").val()) {
        $("#register-errorMessage").html("passwords don't match");
      } else {
        if (isValidPassword(password) && $("#account-password").val() === $("#account-confirm-password").val()) {
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
          $("#register-errorMessage").html("password must have more than 6 letters");
        }
      }

      return false;
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}