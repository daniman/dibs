Meteor.startup(function () {
	console.log('startup');
	var timeOfLastRequest = 0;

	Accounts.emailTemplates.siteName = "Dibs! ReUse Map Client";
	Accounts.emailTemplates.from = "Dibs Admin <calldibs@mit.edu>";

	// Posts.allow({
	//     'update': function(userId, docs, fields, modifier) {
	//         return _.all(docs, function(doc) {
	//             // // Can only change your own documents
	//             // if (userId !== doc._id) {
	//             //     return false
	//             // }
	//             return true
	//         })
	//     }
	// });

	//Retrieve new found posts from Parse every 2.7 secs
	Meteor.setInterval( function(){
		console.log("timeOfLastRequest:"+timeOfLastRequest);
		// RESTful Parse Query with fixed params
		result = Meteor.http.get('https://api.parse.com/1/classes/ReuseItem?', { //where={"guess_found":true}',{ //"https://api.parse.com/1/classes/SuperDildo", {//TestReuseItem_rev2
			headers: {
				"X-Parse-Application-Id": "KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V",
				"X-Parse-REST-API-Key": "ES02u7gPWXSmOshD1Lwo2yhxjj4j0fxbcqdTUSBE"
			},
			params: {
				where: "{"+
					"\"guess_found\":true,"+
					"\"email_timestamp_unix\": {\"$gt\":"+timeOfLastRequest+"}"+
				"}",
				order: '-email_timestamp_unix'
			}
		});


		if (result.statusCode === 200){
			var respJson = JSON.parse(result.content);
			console.log(respJson.results.length);
			if (respJson.results.length>0){
				_.forEach(respJson.results, function(listing) {
					Posts.upsert({emailId: listing.email_id}, {
						$set: {
							userId: 'reuse list',

							parseId: listing.objectId,

							title: listing.email_subject,
							content: listing.email_body,
							claimedBy: listing.claimed_by,
							emailId: listing.email_id,
							emailSender: listing.email_sender, //empty
							postTimeUnix: listing.email_timestamp_unix,
							latitude: listing.gps_location.latitude,
							longitude: listing.gps_location.longitude,
							guessFound: listing.guess_found,
							itemLocationGeneral: listing.item_location_general,
							claimed: listing.claimed,
							itemLocationSpecific: listing.item_location_specific,
							keywords: listing.keywords,
							// postDateTime: listing.email_datetime,
							postDateTime: formatDate(listing.email_datetime),
							// postDateTime: formatDate(listing.email_timestamp_unix),
							senderAddress: listing.email_senderAddress,
							author: listing.email_senderName,
							guessLastResort: listing.guess_last_resort,
							uniqueViewersList: [],
							uniqueViewers: listing.uniqueViewers
						}
					});			
				});

				timeOfLastRequest = respJson.results[0].email_timestamp_unix;
			}
		}else{
			console.log(result.statusCode);
		}
		
		console.log('Recieved Data from Parse');
	}, 30000);
});

formatDate = function(utcDate) {
	var date = new Date(utcDate);
	tmpDate = date + "";
	tmpDate = tmpDate.slice(0, 21);
	if (tmpDate.charAt(tmpDate.length-3) == ":") {
		return tmpDate
	} else {
		return date.toUTCString();
	}
}