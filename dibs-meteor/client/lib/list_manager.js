listmanager = {
	clearListFormatting: function() {
		$('.post').removeClass('post-active');
		// console.log('cleared post list formatting');
	},

	setListFocus: function(_id) {
		listmanager.clearListFormatting();
		console.log('ID:'+_id);
		$("#category_"+_id).addClass('post-active');
		$('#postListContainer').stop().animate({scrollTop: $("#category_"+_id).offset().top});
	}
}