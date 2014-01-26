listmanager = {
	clearListFormatting: function() {
		$('.post').removeClass('post-active');
		console.log('cleared post list formatting');
	},

	setListFocus: function(_id) {
		listmanager.clearListFormatting();
		$("#category_"+_id+".post").addClass('post-active');
		$('#postListContainer').animate({scrollTop: $("#category_"+_id).position().top});
	}
}