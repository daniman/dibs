// Template.postItem.helpers({
// 	domain: function(){
// 		var a =document.createElement('a')
// 		a.href = this.url;
// 		return a.hostname;
// 	}
// });

Template.postItem.events({
	'click': function(event){
		console.log(this.data);
	}
});

