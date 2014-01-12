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
    },
    'submit #login-form' : function(e, t){
      e.preventDefault();
      // retrieve the input field values
      var email = t.find('#login-email').value, password = t.find('#login-password').value;
      Meteor.loginWithPassword(email, password, function(err){ 
        if (err) {
          alert("can't log in..");
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
    },
    'submit #register-form' : function(e, t) {
      console.log("new registration started");
      e.preventDefault();
      var email = t.find('#account-email').value, password = t.find('#account-password').value;

      console.log("email " + email);
      console.log("password " + password);

      // trim helper
      var trimInput = function(val) {
        return val.replace(/^\s*|\s*$/g, "");
      }
      var email = trimInput(email);

      var isValidPassword = function(val) {
        return val.length >= 6; 
      }

      console.log(isValidPassword(password));

      if (isValidPassword(password)) {
        Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            // Inform the user that account creation failed
            alert("unable to make account");
          } else {
            // Success. Account has been created and the user
            // has logged in successfully.
            console.log("new account successfully made");
          }
        });
      }

      return false;
    }
  });

  $(document).ready(function() {
    $(".fancybox").fancybox();
    $("#socialLinkHolder").mouseenter(function() {
      $(".fa-info-circle").addClass("info-big");
      $(".fa-facebook").addClass("facebook-big");
      $(".fa-twitter").addClass("twitter-big");
      $(".fa-github").addClass("github-big");
      $(".fa-info-circle").addClass("fa-3x");
      $(".fa-facebook").addClass("fa-3x");
      $(".fa-twitter").addClass("fa-3x");
      $(".fa-github").addClass("fa-3x");
    }).mouseleave(function() {
      $(".fa-info-circle").removeClass("info-big");
      $(".fa-facebook").removeClass("facebook-big");
      $(".fa-twitter").removeClass("twitter-big");
      $(".fa-github").removeClass("github-big");
      $(".fa-info-circle").removeClass("fa-3x");
      $(".fa-facebook").removeClass("fa-3x");
      $(".fa-twitter").removeClass("fa-3x");
      $(".fa-github").removeClass("fa-3x");
    });
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}