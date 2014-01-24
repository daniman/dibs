var email;
var password;

$(document).ready(function() {
  $("#createNewAccount").click(function() {
    $("#account-email").val($("#login-email").val());
    $("#account-password").val($("#login-password").val());
    $("#login-email").val("");
    $("#login-password").val("");
    $("#login-errorMessage").html("");
  });
  $("#forgotPassword").click(function() {
    $("#password-recover-email").val($("#login-email").val());
    $("#login-password").val("");
  });
  $("#logIn").click(function() {
    $("#login-email").val($("#account-email").val());
    $("#login-password").val($("#account-password").val());
    $("#account-email").val("");
    $("#account-password").val("");
    $("#account-confirm-password").val("");
    $("#register-1-errorMessage").html("");
  });
});

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
        setTimeout(function() {
            document.getElementById("toggle").checked = false;
        }, 2000);
      }
    });
    return false; 
  },

  'submit #register-1-form' : function(e, t) { // when the user submits request to create a new account
    e.preventDefault();
    email = $('#account-email').val();
    password = $('#account-password').val();

    // trim helper
    var trimInput = function(val) {
      return val.replace(/^\s*|\s*$/g, "");
    }
    email = trimInput(email); // trim email

    var isValidPassword = function(val) { // specifies that a user's password must be more than six characters
      return val.length >= 6; 
    }

    if (email === "") { // if the user tries to submit w/o entering an email
      $("#register-1-errorMessage").html("please enter an email");
    } else if (password === "") { // if the user tries to submit w/o entering a password
      $("#register-1-errorMessage").html("please enter a password");
    } else if (password !== $("#account-confirm-password").val()) { // if the user's two passwords don't match
      $("#register-1-errorMessage").html("passwords don't match");
    } else {
      if (isValidPassword(password)) {
        $('#register-2').prop('checked', true);
        $("#register-1-errorMessage").html("");
      } else {
        $("#register-1-errorMessage").html("passwords must be at least 6 chars");
      }
    }

    return false;
  },

  'submit #register-2-form' : function(e, t) { // when the user submits request to create a new account
    e.preventDefault();

    console.log($("#mit-student").val());
    if ($("#mit-student").val().toLowerCase() !== "yes") {
      $("#register-2-errorMessage").html("you must be an mit-affiliate to join Dibs");
    } else {
      if ($("#terms-of-service").is(":checked")) {
        Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            $("#register-2-errorMessage").html("account already exists"); // inform the user that account creation failed
          } else {
            // success - account has been created and the user has logged in successfully
            console.log("account successfully made");
            setTimeout(function() {
                document.getElementById("toggle").checked = false;
            }, 2000);
          }
        });
      } else {
        $("#register-2-errorMessage").html("please read and accept the TOS");
      }
    }

    return false;
  },

  'submit #password-recover-form' : function(e, t) {
      console.log("click");
        e.preventDefault();
        var email = $('#password-recover-email').val();
        if ((email !== "")) {
          Accounts.forgotPassword({email: email}, function(err){
          if (err) {
           $('#password-errorMessage').html('Password Reset Error &amp; Doh');
           console.log("fail");
          }
          else {
            $('#password-errorMessage').html('Email Sent &amp; Please check your email.');
            console.log("success");
          }
        });
        }
        return false; 
      },


});




var loginButtonsSession = Accounts._loginButtonsSession;

passwordEntered = function () {
  alert("change!");
}

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