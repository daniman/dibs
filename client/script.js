if (Meteor.isClient) {

  Template.page.rendered = function() {
      var mapOptions = {
            center: new google.maps.LatLng(42.357, -71.09),
            zoom: 15,
            disableDefaultUI: true
          };
      var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  }
  
  Session.set('map', true); // global flag saying we initialized already

  Template.login.events({

    'submit #login-form' : function(e, t){
      e.preventDefault();
      // retrieve the input field values
      var email = t.find('#login-email').value
        , password = t.find('#login-password').value;

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err){ 

        if (err) {
            // The user might not have been found, or their passwword
          // could be incorrect. Inform the user that their
          // login attempt has failed. 
          } else {
            // The user has been logged in.
          }

      });
         return false; 
      }
  });

  Template.logout.events({

    'submit #logout-form' : function(e, t){

      Meteor.logout(function(){ 

      });
         return false; 
      }
  });

  Template.register.events({
    'submit #register-form' : function(e, t) {
      e.preventDefault();
      var email = t.find('#account-email').value
        , password = t.find('#account-password').value;

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

}

console.log("fox");

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}