//A collection for testing purposes
Posts = new Meteor.Collection('posts');

Meteor.methods({
  post: function(postAttributes) {
    console.log('method post');
    var user = Meteor.user();
    console.log('user'+user);

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
      author: user.username, 
      postTimeUnix: Date.now()/1000,
      postDateTime: formatDate(d.toUTCString()),
      uniqueViewersList: [],
      uniqueViewers: 0
    });
    console.log('post'+post);

    // var postId = ;
    // console.log('postId'+postId);
    return Posts.insert(post);
  },


  remove: function(){

  },
});

formatDate = function(utcDate) {
	var date = new Date(utcDate);
	tmpDate = date + "";
	tmpDate = tmpDate.slice(0, 21);
	//console.log(tmpDate.charAt(tmpDate.length-3));
	if (tmpDate.charAt(tmpDate.length-3) == ":") {
		return tmpDate
	} else {
		return date.toUTCString();
	}
}
