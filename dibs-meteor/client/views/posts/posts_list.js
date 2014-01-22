Template.postsList.helpers({
  posts: function() {
    return Posts.find();
  }
});

$(document).ready(function() {
	$(".fancybox").fancybox();
	$(".draggable").draggable();
});