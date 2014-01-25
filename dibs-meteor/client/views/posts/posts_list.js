Template.postsList.helpers({
  posts: function() {
    return Posts.find({}, {sort: {postTimeUnix: -1}});
  }
});

$(document).ready(function() {

	console.log(window.innerHeight);
	document.getElementById("hsvScale").height = Math.floor(window.innerHeight / 2);
	console.log($("#hsvScale").height($(window).height));

	$(".fancybox").fancybox();
	$(".draggable").draggable();
});
