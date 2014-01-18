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
        Accounts.sendVerificationEmail(email);
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





var loginButtonsSession = Accounts._loginButtonsSession;

passwordEntered = function () {
  alert("change!");
}

displayName = function () {
  var user = Meteor.user();
  if (!user)
    return '';

  if (user.profile && user.profile.name)
    return user.profile.name;
  if (user.username)
    return user.username;
  if (user.emails && user.emails[0] && user.emails[0].address)
    return user.emails[0].address;

  return '';
};

validateUsername = function (username) {
  if (username.length >= 3) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Username must be at least 3 characters long");
    return false;
  }
};
validateEmail = function (email) {
  if (passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL" && email === '')
    return true;

  if (email.indexOf('@') !== -1) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Invalid email");
    return false;
  }
};
validatePassword = function (password) {
  if (password.length >= 6) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Password must be at least 6 characters long");
    return false;
  }
};