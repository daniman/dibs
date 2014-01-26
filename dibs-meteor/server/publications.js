Meteor.publish('posts', function() {
	return Posts.find({postTimeUnix:{$gt:Date.now()/1000-(3*86400)}});
});