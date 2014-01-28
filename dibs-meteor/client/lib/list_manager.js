listmanager = {
	clearListFormatting: function() {
		console.log("clear");
		$('.post').removeClass('post-active');
		// console.log('cleared post list formatting');
	},

	setListFocus: function(_id) {
		listmanager.clearListFormatting();
// <<<<<<< HEAD
// 		console.log('ID:'+_id);
// 		$("#category_"+_id).addClass('post-active');
// 		$('#postListContainer').stop().animate({scrollTop: $("#category_"+_id).offset().top});
// =======
		setTimeout(function() {
            $('#category_'+_id).addClass('post-active');
        }, 100);
		$('#category_'+_id).ScrollTo();

	}
}