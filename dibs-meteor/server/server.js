Meteor.startup(function () {
	var timeOfLastRequest = 0;
	//Retrieve new found posts from Parse every 2.7 secs
	Meteor.setInterval( function(){
		
		// RESTful Parse Query with fixed params
		result = Meteor.http.get('https://api.parse.com/1/classes/ReuseItem?', { //where={"guess_found":true}',{ //"https://api.parse.com/1/classes/SuperDildo", {//TestReuseItem_rev2
			headers: {
				"X-Parse-Application-Id": "KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V",
				"X-Parse-REST-API-Key": "ES02u7gPWXSmOshD1Lwo2yhxjj4j0fxbcqdTUSBE"
			},
			params: {
				where: "{\"guess_found\":true}"
			}
		});


		if (result.statusCode === 200){
			var respJson = JSON.parse(result.content);
			_.forEach(respJson.results, function(listing) {
				Posts.upsert({parseId: listing.objectId}, {
					$set: {
						parseId: listing.objectId,
						title: listing.email_subject,
						author: listing.email_sender,
						postTime: listing.email_timestep_unix,
						content: listing.email_body,
						latitude: listing.gps_location.latitude,
						longitude: listing.gps_location.longitude,
					}
				});			
			});
		}
		timeOfLastRequest = Date.getTime();
		console.log('Recieved Data from Parse');
	}, 30000);
});