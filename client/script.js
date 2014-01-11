if (Meteor.isClient) {

  Template.page.rendered = function() {

      $("#login-holder").hide();

      var mapOptions = {
            center: new google.maps.LatLng(42.357, -71.09),
            zoom: 15,
            disableDefaultUI: true
          };
      var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
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

      var email = t.find('#login-email').value
        , password = t.find('#login-password').value;


      setTimeout(function() {
        $("#tint").fadeIn(),
        $("#welcome").fadeIn(),
        $("#signUp").fadeIn()
      }, 500);
    });
    
    var initialLocation;
    var mitCampus = new google.maps.LatLng (42.357,-71.09);
    var browserSupportFlag = new Boolean();
  
    $("#signUp").click(function() {
      $("#tint").fadeOut();
      $(this).fadeOut();
      $("#welcome").fadeOut();

      setTimeout(function() {
        $("#logo").fadeIn(), $("#signUpForm").fadeIn()}, 500);
      
    });




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


  Template.body.rendered = function() {
    var mapOptions = {
          zoom: 15,
          disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

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
      e.preventDefault();
      var email = t.find('#account-email').value, password = t.find('#account-password').value;

      // trim helper
      var trimInput = function(val) {
        return val.replace(/^\s*|\s*$/g, "");
      }
      var email = trimInput(email);

      var isValidPassword = function(val) {
        return val.length == 6; 
      }

      if (isValidPassword(userPassword)) {
        Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            // Inform the user that account creation failed
          } else {
            // Success. Account has been created and the user
            // has logged in successfully. 
          }
        });
      }

      return false;
    }
  });
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
  } 
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}