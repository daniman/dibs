Meteor.subscribe('posts', {postTimeUnix:{$gt:Date.now()/1000-(3*86400)}});

if(Meteor.is_server) {

   Posts.allow({
    'insert': function (userId,doc) {
      /* user and doc checks ,
      return true to allow insert */
      return true; 
    }
  });	

}