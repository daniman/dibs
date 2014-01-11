if (Meteor.isClient) {

  $(document).ready(function(){

    $("#logo").hide();
    $("#signUpForm").hide();

    $("#toWelcome").click(function() {
      $("#logo").fadeOut();
      $("#signUpForm").fadeOut();

      setTimeout(function() {
        $("#tint").fadeIn(),
        $("#welcome").fadeIn(),
        $("#signUp").fadeIn()
      }, 500);
    });

    $("#signUp").click(function() {
      $("#tint").fadeOut();
      $(this).fadeOut();
      $("#welcome").fadeOut();

      setTimeout(function() {
        $("#logo").fadeIn(), $("#signUpForm").fadeIn()}, 500);
      
    });

  });

  Template.body.rendered = function() {
    var mapOptions = {
          center: new google.maps.LatLng(42.357, -71.09),
          zoom: 15,
          disableDefaultUI: true
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
      }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}