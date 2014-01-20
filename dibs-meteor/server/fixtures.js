//  Pre-populated seed data here

if(Meteor.users.find().count() === 0) {
	var andrew = {
		email: "calldibs@mit.edu",
		password: "admins"
	}

	Accounts.createUser(andrew);
}