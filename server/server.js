Meteor.startup(function () {
	//var lastParseRead = 
	// A Test to get parse data
	// result = Meteor.http.get('https://api.parse.com/1/classes/TestReuseItem_rev2?where={"guess_found":{"$ne":false}}',{ //"https://api.parse.com/1/classes/SuperDildo", {//TestReuseItem_rev2
	// 	headers: {
	// 		"X-Parse-Application-Id": "KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V",
	// 		"X-Parse-REST-API-Key": "ES02u7gPWXSmOshD1Lwo2yhxjj4j0fxbcqdTUSBE"
	// 	}
	// });

	// if (result.statusCode === 200){
	// 	var respJson = JSON.parse(result.content);
	// 	_.forEach(respJson.results, function(listing) {
	// 		if listing not in 
	// 		//Listings.insert(listing, function(err) {if(err) console.error(err);});
	// 		console.log(listing);
	// 	})
	// 	console.log('Total available Posts:'+ respJson.results.length);
	// }
	//console.log(result.content);


	Accounts.config({
		sendVerificationEmail: true,
		forbidClientAccountCreation: false
	});

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