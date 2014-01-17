Meteor.startup(function () {
	// A Test to get parse data
	result = Meteor.http.get("https://api.parse.com/1/classes/SuperDildo", {
	   headers: {
	      "X-Parse-Application-Id": "KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V",
	      "X-Parse-REST-API-Key": "ES02u7gPWXSmOshD1Lwo2yhxjj4j0fxbcqdTUSBE"
	   }
	});
	console.log(result);

});