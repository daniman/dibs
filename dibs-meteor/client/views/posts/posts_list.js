Template.postsList.helpers({
  posts: function() {
    return Posts.find({}, {sort: {postTimeUnix: -1}});
  },
  numberOfPosts: function(){
  	return Posts.find().count();
  }
});

$(document).ready(function() {
	$(".fancybox").fancybox();
	$(".draggable").draggable();
});
