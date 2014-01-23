// Template.postItem.helpers({
// 	domain: function(){
// 		var a =document.createElement('a')
// 		a.href = this.url;
// 		return a.hostname;
// 	}
// });

Template.postItem.events({
	'click': function(event){
		console.log('Clicked on a post!!!');
		console.log(this._id);
	}
});

