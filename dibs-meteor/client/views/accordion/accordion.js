// allows easy access of username from within html handlebars
Template.accordion.displayName = function () {
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
}; // referring to helper funtion displayName() in login.js 

Template.accordion.events({
  'click #logout' : function(e, t) {
    Meteor.logout(function(){ });
    return false; 
  },

  'click #accountSettings' : function(e, t) {
    $("#changePasswordPopup").css({"display": "block"});
  },

  'click #ac-1-label' : function(e, t) {
    document.getElementById("ac-2").checked = false;
    document.getElementById("ac-3").checked = false;
    document.getElementById("ac-4").checked = false;
  },

  'click #ac-2-label' : function(e, t) {
    document.getElementById("ac-1").checked = false;
    document.getElementById("ac-3").checked = false;
    document.getElementById("ac-4").checked = false;
  },

  'click #ac-3-label' : function(e, t) {
    document.getElementById("ac-1").checked = false;
    document.getElementById("ac-2").checked = false;
    document.getElementById("ac-4").checked = false;
  },

  'click #ac-4-label' : function(e, t) {
    document.getElementById("ac-1").checked = false;
    document.getElementById("ac-2").checked = false;
    document.getElementById("ac-3").checked = false;
  }

  // 'click #accountSettings' : function(e, t) {
  //     e.preventDefault();
  //       var pw = t.find('#new-password-password').value;
  //       if (isNotEmpty(pw) &amp;&amp; isValidPassword(pw)) {
  //         Session.set('loading', true);
  //         Accounts.resetPassword(Session.get('resetPassword'), pw, function(err){
  //           if (err)
  //             Session.set('displayMessage', 'Password Reset Error &amp; Sorry');
  //           else {
  //             Session.set('resetPassword', null);
  //           }
  //           Session.set('loading', false);
  //         });
  //       }
  //     return false; 
  //     }
  // }
});