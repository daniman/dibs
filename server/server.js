Meteor.startup(function () {
	
	// Accounts.config({
	// 	sendVerificationEmail: true,
	// 	forbidClientAccountCreation: false
	// });

	//setup for Parse API
	// Parse.initialize("KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V", "sXds7BqaSnQTpfszRNgQ0UO5h17fkGdIZwWgNi0A");
	// var TestObject = Parse.Object.extend("TestObject");
	// var testObject = new TestObject();
	// testObject.save({foo: "bar"}).then(function(object) {
	//   alert("yay! it worked");
	// });

	Items.allow({
	    'insert': function (userId,doc) {
	      /* user and doc checks ,
	      return true to allow insert */
	      return true; 
	    }
	});

	Meteor.publish("items", function () {
	  return Parties.find(
	    {$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]});
	});

	Items.remove({});
});