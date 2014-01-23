Template.postsList.helpers({
  posts: function() {
    return Posts.find({}, {sort: {postTimeUnix: -1}});
  }
});

$(document).ready(function() {
	$(".fancybox").fancybox();
	$(".draggable").draggable();
});