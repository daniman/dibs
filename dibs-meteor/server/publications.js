Meteor.publish('posts', function() {
	var maxDays = 5;
	if (this.userId !== null){
		return Posts.find({postTimeUnix:{$gt:Date.now()/1000-(maxDays*86400)}});
	}
	return false;
});