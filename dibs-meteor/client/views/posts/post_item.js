// Template.postItem.helpers({
// 	domain: function(){
// 		var a =document.createElement('a')
// 		a.href = this.url;
// 		return a.hostname;
// 	}
// });

// Template.postItem.rendered = function(){
//     var element = $(".post");
//     console.log(this);
//     $(this.firstNode).addId()
//     // if(!element.hasClass("app")){
//     //     element.addClass("app"); 
//     // }
// }

Template.postItem.events({
	'click': function(event){
		gmaps.setFocusToMarker(gmaps.findMarkerById(this._id));
		listmanager.setListFocus(this._id);
	},

	'mouseenter': function (event){
		gmaps.findMarkerById(this._id).setAnimation(google.maps.Animation.BOUNCE);
	},

	'mouseleave': function (event){
		gmaps.findMarkerById(this._id).setAnimation(null);
		// gmaps.stopAllAnimation();
	},


});

