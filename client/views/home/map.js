// Template.map.rendered = function() {
//     if (! Session.get('map'))
//         gmaps.initialize();
 
//     Deps.autorun(refreshPosts());
// }

// function refreshPosts() {
// 	var posts = Listings
 
//         _.each(posts, function(post) {
//             if (typeof post.location !== 'undefined' &&
//                 typeof post.location.latitude !== 'undefined' &&
//                 typeof post.location.longitude !== 'undefined') {
 
//                 var objMarker = {
//                     id: post._id,
//                     lat: post.location.latitude,
//                     lng: post.location.longitude,
//                     title: post.name
//                 };
 
//                 // check if marker already exists
//                 if (!gmaps.markerExists('id', objMarker.id))
//                     gmaps.addMarker(objMarker);
 
//             }
//         });
// }
 
// Template.map.destroyed = function() {
//     Session.set('map', false);