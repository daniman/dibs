Template.changePassword.events({

	'submit #change-password-form': function(e, t) {
		e.preventDefault();
		var oldPassword = $("#old-password").val();
		var newPassword = $("#new-password").val();
		var confirmNewPassword = $("#confirm-new-password").val();
		if (newPassword == confirmNewPassword) {
			if (validatePassword(newPassword)) {
				console.log("here");
				Accounts.changePassword(oldPassword, newPassword, function(err) {
					if (err) {
						$('#changePasswordError').html("You've entered your old password incorrectly.");
					} else {
						// success, new password saved
						$("#changePasswordPopup").fadeOut();
					}
				});
			}
		}
	},

	'click #closeChangePassword' : function(e, t) {
	    $("#changePasswordPopup").css({"display": "none"});
	}

});