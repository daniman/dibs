//A collection for testing purposes
Posts = new Meteor.Collection('posts');

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user();
    

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new items.");

    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a Title');

  	// if (!postAttributes.latitude || !postAttributes.latitude)
  	// 	throw new Meteor.Error(423, 'Please Fill in location');

    // check that there are no previous posts with the same link
    // if (postAttributes.url && postWithSameLink) {
    //   throw new Meteor.Error(302, 
    //     'This link has already been posted', 
    //     postWithSameLink._id);
    // }

    // pick out the whitelisted keys
    var d = new Date();
    var post = _.extend(postAttributes, {
      userId: user._id, 
      author: Meteor.user().emails[0].address, 
      postTimeUnix: Date.now()/1000,
      postDateTime: formatDate(d.toUTCString()),
      uniqueViewersList: [],
      uniqueViewers: 0
    });

    return Posts.insert(post);
  },

  viewedPost: function(post_id){
  	var post = Posts.find({_id:post_id});
  	//console.log(post.uniqueViewersList);
  	//console.log(Meteor.user()._id in post.uniqueViewersList);
  },


  remove: function(){
  },

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
