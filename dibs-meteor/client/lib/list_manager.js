listmanager = {
	clearListFormatting: function() {
		$('.post').removeClass('post-active');
		// console.log('cleared post list formatting');
	},

	setListFocus: function(_id) {
		listmanager.clearListFormatting();
		setTimeout(function() {
            $('#category_'+_id).addClass('post-active');
            $('#category_'+_id).ScrollTo();
        }, 100);
	}
}