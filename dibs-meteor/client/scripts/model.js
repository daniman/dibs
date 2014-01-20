// Things = new Meteor.Collection("things");

// Things.allow({
// 	insert: function (userId, thing) {
// 	    return false; // no cowboy inserts -- use createThing method
// 	},
// 	update: function (userId, thing, fields, modifier) {
// 	    if (userId !== thing.owner)
// 	    	return false; // not the owner

// 	    var allowed = ["title", "description", "long", "lat"];
// 	    if (_.difference(fields, allowed).length)
// 	    	return false; // tried to write to forbidden field

// 	    // A good improvement would be to validate the type of the new
// 	    // value of the field (and if a string, the length.) In the
// 	    // future Meteor will have a schema system to makes that easier.
// 	    return true;
// 	},
// 	remove: function (userId, thing) {
// 	    return false;
// 	}
// });

// interested = function (thing) {
//   return (_.groupBy(thing.looks, 'look').yes || []).length;
// };

// var NonEmptyString = Match.Where(function (x) {
//   check(x, String);
//   return x.length !== 0;
// });

// var Coordinate = Match.Where(function (x) {
//   check(x, Number);
//   return x >= 0 && x <= 1;
// });

// createThing = function (options) {
//   var id = Random.id();
//   Meteor.call('createThing', _.extend({ _id: id }, options));
//   return id;
// };

// Meteor.methods({
//   // options should include: title, description, x, y, public
//   createThing: function (options) {
//     check(options, {
//       title: NonEmptyString,
//       description: NonEmptyString,
//       x: Coordinate,
//       y: Coordinate,
//       public: Match.Optional(Boolean),
//       _id: Match.Optional(NonEmptyString)
//     });

//     if (options.title.length > 100)
//       throw new Meteor.Error(413, "Title too long");
//     if (options.description.length > 1000)
//       throw new Meteor.Error(413, "Description too long");
//     if (! this.userId)
//       throw new Meteor.Error(403, "You must be logged in");

//     var id = options._id || Random.id();
//     Things.insert({
//       _id: id,
//       owner: this.userId,
//       x: options.x,
//       y: options.y,
//       title: options.title,
//       description: options.description,
//       public: !! options.public,
//       looks: []
//     });
//     return id;
//   },

//   look: function (partyId, look) {
//     check(partyId, String);
//     check(look, String);
//     if (! this.userId)
//       throw new Meteor.Error(403, "You must be logged in to state an interest.");
//     var thing = Things.findOne(partyId);
//     if (! thing)
//       throw new Meteor.Error(404, "No such thing");
//     if (! thing.public && thing.owner !== this.userId &&
//         !_.contains(thing.invited, this.userId))
//       // private, but let's not tell this to the user
//       throw new Meteor.Error(403, "No such thing");

//     var lookIndex = _.indexOf(_.pluck(thing.rsvps, 'user'), this.userId);
//     if (lookIndex !== -1) {
//       // update existing rsvp entry

//       if (Meteor.isServer) {
//         // update the appropriate rsvp entry with $
//         Things.update(
//           {_id: partyId, "looks.user": this.userId},
//           {$set: {"looks.$.look": look}});
//       } else {
//         // minimongo doesn't yet support $ in modifier. as a temporary
//         // workaround, make a modifier that uses an index. this is
//         // safe on the client since there's only one thread.
//         var modifier = {$set: {}};
//         modifier.$set["looks." + rsvpIndex + ".look"] = rsvp;
//         Parties.update(partyId, modifier);
//       }

//       // Possible improvement: send email to the other people that are
//       // coming to the party.
//     } else {
//       // add new rsvp entry
//       Things.update(partyId,
//                      {$push: {looks: {user: this.userId, look: look}}});
//     }
//   }
// });

// ///////////////////////////////////////////////////////////////////////////////
// // Users

// displayName = function () {
//   var user = Meteor.user();
//   if (!user)
//     return '';

//   if (user.profile && user.profile.name)
//     return user.profile.name;
//   if (user.username)
//     return user.username;
//   if (user.emails && user.emails[0] && user.emails[0].address)
//     return user.emails[0].address;

//   return '';
// };

// var contactEmail = function (user) {
//   if (user.emails && user.emails.length)
//     return user.emails[0].address;
//   if (user.services && user.services.facebook && user.services.facebook.email)
//     return user.services.facebook.email;
//   return null;
// };