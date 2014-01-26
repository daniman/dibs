Template.postsList.helpers({
  posts: function() {
    return Posts.find({postTimeUnix:{$gt:Date.now()/1000-(3*86400)}}, {sort: {postTimeUnix: -1}});
  },
  numberOfPosts: function(){
  	return Posts.find().count();
  }
});

$(document).ready(function() {

	console.log(window.innerHeight);
	document.getElementById("hsvScale").height = Math.floor(window.innerHeight / 2);
	console.log($("#hsvScale").height($(window).height));

	$(".fancybox").fancybox();
	$(".draggable").draggable();
});
