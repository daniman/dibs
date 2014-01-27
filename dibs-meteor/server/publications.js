Meteor.publish('posts', function() {
	
	if (this.userId !== null){
		return Posts.find({postTimeUnix:{$gt:Date.now()/1000-(3*86400)}});
	}
	return false;
});